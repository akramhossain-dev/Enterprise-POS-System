import { Worker, Job } from 'bullmq';
import { redisConnection } from '../modules/notification/queue';
import { runExpiryAlertJob, runLowStockAlertJob, runReorderScanJob } from './inventory-jobs';
import { prisma } from '../lib/prisma';
import { createLogger } from '../lib/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

const log = createLogger('workers');
const connection = redisConnection as unknown as never;

// Helper to catch and log worker handler errors
function registerWorkerHandlers(worker: Worker) {
  worker.on('failed', (job: Job | undefined, err: Error) => {
    log.error(
      `Job ${job?.id ?? 'unknown'} in queue ${worker.name} failed with error: ${err.message}`,
    );
  });
  worker.on('completed', (job: Job) => {
    log.debug(`Job ${job.id ?? 'unknown'} in queue ${worker.name} completed successfully.`);
  });
}

// 1. Low Stock Worker
export const lowStockWorker = new Worker(
  'low-stock-queue',
  async (job: Job) => {
    log.info(`Starting Low Stock Job ID ${job.id ?? 'unknown'}`);
    const stockAlertRes = await runLowStockAlertJob();
    const reorderRes = await runReorderScanJob();
    log.info(
      `Low Stock Job ID ${job.id ?? 'unknown'} completed. Checked ${String(stockAlertRes.companies)} companies, created ${String(stockAlertRes.created)} alerts, resolved ${String(stockAlertRes.resolved)}. Reorder suggestions: ${String(reorderRes.suggestions)}`,
    );
  },
  { connection },
);
registerWorkerHandlers(lowStockWorker);

// 2. Expiry Worker
export const expiryWorker = new Worker(
  'expiry-queue',
  async (job: Job) => {
    log.info(`Starting Expiry Scan Job ID ${job.id ?? 'unknown'}`);
    const res = await runExpiryAlertJob();
    log.info(
      `Expiry Scan Job ID ${job.id ?? 'unknown'} completed. Expired ${String(res.expiredBatches)} batches, created ${String(res.alertsCreated)} alerts.`,
    );
  },
  { connection },
);
registerWorkerHandlers(expiryWorker);

// 3. Daily Summary and Maintenance Worker
export const dailySummaryWorker = new Worker(
  'daily-summary-queue',
  async (job: Job) => {
    log.info(`Processing maintenance/summary job ${job.name}`);
    if (job.name === 'daily-sales-summary') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const summary = await prisma.sale.aggregate({
        where: { saleDate: { gte: today } },
        _sum: { grandTotal: true },
        _count: true,
      });
      log.info(
        `Daily Sales Summary: ${String(summary._count)} sales, total grand total: ${String(summary._sum.grandTotal ?? 0)}`,
      );
    } else if (job.name === 'cleanup-sessions-tokens') {
      const sessionsRes = await prisma.userSession.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      const tokensRes = await prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      log.info(
        `Cleaned up ${String(sessionsRes.count)} expired sessions and ${String(tokensRes.count)} expired refresh tokens.`,
      );
    } else if (job.name === 'archive-old-logs') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      const logsRes = await prisma.auditLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      log.info(`Archived/purged ${String(logsRes.count)} old audit logs.`);
    }
  },
  { connection },
);
registerWorkerHandlers(dailySummaryWorker);

// 4. Backup Worker — pg_dump based database backup
export const backupWorker = new Worker(
  'backup-queue',
  async (job: Job) => {
    log.info(`Processing DB backup job ${job.id ?? 'unknown'}`);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      log.error('DATABASE_URL is not set — cannot perform backup');
      return;
    }

    // Create backups directory if it doesn't exist
    const backupsDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupsDir, `backup-${timestamp}.sql`);

    try {
      // Run pg_dump using DATABASE_URL
      await execAsync(`pg_dump "${dbUrl}" -f "${backupFile}" --no-password`, {
        timeout: 5 * 60 * 1000, // 5 minute timeout
      });

      const stats = fs.statSync(backupFile);
      const sizeMb = (stats.size / 1024 / 1024).toFixed(2);

      log.info(
        { backupFile, sizeMb: `${sizeMb} MB`, jobId: job.id ?? 'unknown' },
        'Database backup completed successfully',
      );
    } catch (error) {
      log.error({ error, backupFile }, 'Database backup failed');
      // Remove empty/corrupt backup file on failure
      if (fs.existsSync(backupFile)) {
        fs.unlinkSync(backupFile);
      }
      throw error;
    }
  },
  { connection },
);
registerWorkerHandlers(backupWorker);

// 5. Report Generation Worker
export const reportGenerationWorker = new Worker(
  'report-generation-queue',
  async (job: Job) => {
    const jobData = job.data as {
      reportType?: string;
      companyId?: string;
      startDate?: string;
      endDate?: string;
    };
    const { reportType, companyId, startDate, endDate } = jobData;

    log.info(
      { jobId: job.id ?? 'unknown', reportType, companyId, startDate, endDate },
      'Report generation job started',
    );

    if (!companyId) {
      log.error({ jobId: job.id }, 'companyId is required for report generation');
      return;
    }

    // Build date filter
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Ensure reports directory exists
    const reportsDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${reportType ?? 'report'}-${timestamp}.csv`;
    const filePath = path.join(reportsDir, filename);

    // ── CSV helper ──────────────────────────────────────────────────────
    function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
      const escape = (val: string | number | null | undefined): string => {
        const s = val === null || val === undefined ? '' : String(val);
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      };
      return [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    }

    try {
      switch (reportType) {
        case 'sales': {
          const sales = await prisma.sale.findMany({
            where: {
              companyId,
              createdAt: { gte: start, lte: end },
            },
            include: { invoice: true, customer: true },
            orderBy: { createdAt: 'asc' },
          });

          const headers = [
            'Invoice Number',
            'Date',
            'Customer',
            'Subtotal',
            'Tax',
            'Discount',
            'Grand Total',
            'Due Amount',
            'Status',
          ];
          const rows = sales.map((s) => [
            s.invoice?.invoiceNumber ?? s.invoiceNumber,
            s.createdAt.toISOString().split('T')[0],
            s.customer?.fullName ?? 'Walk-in',
            Number(s.subtotal).toFixed(2),
            Number(s.tax).toFixed(2),
            Number(s.discount).toFixed(2),
            Number(s.grandTotal).toFixed(2),
            Number(s.dueAmount).toFixed(2),
            s.status,
          ]);

          fs.writeFileSync(filePath, toCsv(headers, rows), 'utf-8');
          log.info({ filePath, rows: rows.length }, 'Sales report generated');
          break;
        }

        case 'purchase': {
          const orders = await prisma.purchaseOrder.findMany({
            where: {
              companyId,
              createdAt: { gte: start, lte: end },
            },
            include: { supplier: true },
            orderBy: { createdAt: 'asc' },
          });

          const headers = ['PO Number', 'Date', 'Supplier', 'Grand Total', 'Status'];
          const rows = orders.map((o) => [
            o.purchaseOrderNumber,
            o.createdAt.toISOString().split('T')[0],
            o.supplier.companyName,
            Number(o.grandTotal).toFixed(2),
            o.status,
          ]);

          fs.writeFileSync(filePath, toCsv(headers, rows), 'utf-8');
          log.info({ filePath, rows: rows.length }, 'Purchase report generated');
          break;
        }

        case 'inventory': {
          const inventories = await prisma.inventory.findMany({
            where: { companyId },
            include: { product: true, warehouse: true },
            orderBy: { product: { name: 'asc' } },
          });

          const headers = [
            'Product',
            'SKU',
            'Warehouse',
            'Available Qty',
            'Reserved Qty',
            'Min Qty',
            'Reorder Qty',
            'Avg Cost',
          ];
          const rows = inventories.map((i) => [
            i.product.name,
            i.product.sku ?? '',
            i.warehouse.name,
            Number(i.availableQuantity).toFixed(2),
            Number(i.reservedQuantity).toFixed(2),
            Number(i.minimumQuantity).toFixed(2),
            Number(i.reorderQuantity).toFixed(2),
            Number(i.averageCost).toFixed(2),
          ]);

          fs.writeFileSync(filePath, toCsv(headers, rows), 'utf-8');
          log.info({ filePath, rows: rows.length }, 'Inventory report generated');
          break;
        }

        default:
          log.warn({ reportType, jobId: job.id }, 'Unknown report type — no file generated');
          return;
      }

      log.info({ jobId: job.id ?? 'unknown', filePath }, 'Report generation completed');
    } catch (err) {
      log.error({ err, reportType, filePath }, 'Report generation failed');
      if (fs.existsSync(filePath) && filePath !== '') {
        fs.unlinkSync(filePath);
      }
      throw err;
    }
  },
  { connection },
);
registerWorkerHandlers(reportGenerationWorker);

// Shut down helper
export async function closeWorkers() {
  await Promise.all([
    lowStockWorker.close(),
    expiryWorker.close(),
    dailySummaryWorker.close(),
    backupWorker.close(),
    reportGenerationWorker.close(),
  ]);
}

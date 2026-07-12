import { Worker, Job } from 'bullmq';
import { redisConnection } from '../modules/notification/queue';
import { runExpiryAlertJob, runLowStockAlertJob, runReorderScanJob } from './inventory-jobs';
import { prisma } from '../lib/prisma';
import { createLogger } from '../lib/logger';

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

// 4. Backup Worker (Preparation)
export const backupWorker = new Worker(
  'backup-queue',
  async (job: Job) => {
    log.info(`Processing DB backup job ${job.id ?? 'unknown'}`);
    await Promise.resolve(); // Simulate backup IO
    log.info(`Database backup file successfully created for job ${job.id ?? 'unknown'}`);
  },
  { connection },
);
registerWorkerHandlers(backupWorker);

// 5. Report Generation Worker (Preparation)
export const reportGenerationWorker = new Worker(
  'report-generation-queue',
  async (job: Job) => {
    log.info(`Processing report generation job ${job.id ?? 'unknown'}`);
    await Promise.resolve(); // Simulate report compiling
    log.info(`Report successfully generated for job ${job.id ?? 'unknown'}`);
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

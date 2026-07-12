// ─────────────────────────────────────────────
// Background Jobs — B7.3 Advanced Inventory
//
// These are job definitions ready to be wired into
// a job scheduler (e.g., Fastify-cron, BullMQ, node-cron).
//
// Usage example with node-cron:
//   import cron from 'node-cron';
//   cron.schedule('0 6 * * *', () => runExpiryAlertJob());
//   cron.schedule('0 */4 * * *', () => runLowStockAlertJob());
//   cron.schedule('0 8 * * *', () => runReorderScanJob());
// ─────────────────────────────────────────────

import { prisma } from '../lib/prisma';
import { markExpiredBatches } from '../modules/batch/batch.repository';
import { scanAndGenerateAlerts } from '../modules/stock-alert/stock-alert.repository';
import type { Inventory } from '@prisma/client';

// ── Job 1: Expiry Alert ────────────────────────────────────────────────────────
// Runs daily. Marks expired batches and generates EXPIRY_ALERT stock alerts.

export async function runExpiryAlertJob(): Promise<{
  expiredBatches: number;
  alertsCreated: number;
}> {
  let alertsCreated = 0;

  // 1. Auto-expire batches past their expiry date
  const expiredBatches = await markExpiredBatches();

  // 2. Find batches expiring in next 30 days and create EXPIRY_ALERT
  const expiringBatches = await prisma.batch.findMany({
    where: {
      status: 'ACTIVE',
      expiryDate: {
        gte: new Date(),
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },
    select: {
      companyId: true,
      warehouseId: true,
      productId: true,
      expiryDate: true,
      quantity: true,
    },
    distinct: ['companyId', 'warehouseId', 'productId'],
  });

  for (const batch of expiringBatches) {
    try {
      const inv = await prisma.inventory.findUnique({
        where: {
          warehouseId_productId: { warehouseId: batch.warehouseId, productId: batch.productId },
        },
        select: { minimumQuantity: true, reorderQuantity: true, availableQuantity: true },
      });

      await prisma.stockAlert.create({
        data: {
          companyId: batch.companyId,
          warehouseId: batch.warehouseId,
          productId: batch.productId,
          alertType: 'EXPIRY_ALERT',
          currentQuantity: batch.quantity,
          minimumQuantity: inv?.minimumQuantity ?? 0,
          reorderQuantity: inv?.reorderQuantity ?? 0,
          status: 'ACTIVE',
        },
      });
      alertsCreated++;
    } catch {
      // Skip if alert already exists (unique constraint)
    }
  }

  return { expiredBatches, alertsCreated };
}

// ── Job 2: Low Stock Alert ─────────────────────────────────────────────────────
// Runs every 4 hours. Scans all inventories across all companies.

export async function runLowStockAlertJob(): Promise<{
  companies: number;
  created: number;
  resolved: number;
}> {
  const companies = await prisma.company.findMany({ select: { id: true } });
  let totalCreated = 0;
  let totalResolved = 0;

  for (const company of companies) {
    const result = await scanAndGenerateAlerts(company.id);
    totalCreated += result.created;
    totalResolved += result.resolved;
  }

  return { companies: companies.length, created: totalCreated, resolved: totalResolved };
}

// ── Job 3: Daily Reorder Scan ──────────────────────────────────────────────────
// Runs daily at 8 AM. Returns all items below reorder level.

export async function runReorderScanJob(): Promise<{ suggestions: number }> {
  const allInventories = await prisma.inventory.findMany({
    select: {
      id: true,
      productId: true,
      warehouseId: true,
      availableQuantity: true,
      minimumQuantity: true,
    },
  });

  const suggestions = allInventories.filter(
    (
      inv: Pick<
        Inventory,
        'availableQuantity' | 'minimumQuantity' | 'id' | 'productId' | 'warehouseId'
      >,
    ) => inv.availableQuantity.lte(inv.minimumQuantity),
  );
  return { suggestions: suggestions.length };
}

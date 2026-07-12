import { Prisma, AlertType, AlertStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AlertQuery } from './stock-alert.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaAlertWithRelations } from './stock-alert.mapper';

const SELECT = {
  id: true,
  companyId: true,
  warehouseId: true,
  productId: true,
  alertType: true,
  currentQuantity: true,
  minimumQuantity: true,
  reorderQuantity: true,
  status: true,
  resolvedAt: true,
  resolvedBy: true,
  createdAt: true,
  product: { select: { id: true, name: true, sku: true } },
  warehouse: { select: { id: true, name: true, code: true } },
} satisfies Prisma.StockAlertSelect;

export async function findAlerts(
  query: AlertQuery,
): Promise<{ alerts: PrismaAlertWithRelations[]; meta: ReturnType<typeof buildPaginationMeta> }> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });
  const where: Prisma.StockAlertWhereInput = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
    ...(query.productId ? { productId: query.productId } : {}),
    ...(query.alertType ? { alertType: query.alertType } : {}),
    ...(query.status ? { status: query.status } : {}),
  };
  const [alerts, total] = await prisma.$transaction([
    prisma.stockAlert.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: query.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.stockAlert.count({ where }),
  ]);
  return {
    alerts: alerts as unknown as PrismaAlertWithRelations[],
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function findAlertById(id: string): Promise<PrismaAlertWithRelations | null> {
  return prisma.stockAlert.findUnique({ where: { id }, select: SELECT });
}

export async function resolveAlert(
  id: string,
  resolvedBy: string,
): Promise<PrismaAlertWithRelations> {
  return prisma.stockAlert.update({
    where: { id },
    data: { status: AlertStatus.RESOLVED, resolvedAt: new Date(), resolvedBy },
    select: SELECT,
  });
}

// ── Alert Generation ──────────────────────────────────────────────────────────

export interface ScanResult {
  created: number;
  resolved: number;
}

export async function scanAndGenerateAlerts(
  companyId: string,
  warehouseId?: string,
): Promise<ScanResult> {
  // Find all inventories with quantity <= minimumQuantity
  const inventories = await prisma.inventory.findMany({
    where: {
      companyId,
      ...(warehouseId ? { warehouseId } : {}),
      // where availableQuantity <= minimumQuantity
    },
    select: {
      id: true,
      companyId: true,
      warehouseId: true,
      productId: true,
      availableQuantity: true,
      minimumQuantity: true,
      reorderQuantity: true,
    },
  });

  let created = 0;
  let resolved = 0;

  for (const inv of inventories) {
    const current = inv.availableQuantity;
    const minimum = inv.minimumQuantity;
    const reorder = inv.reorderQuantity;

    const isOutOfStock = current.lte(0);
    const isLowStock = current.lte(minimum) && !isOutOfStock;

    const alertType: AlertType | null = isOutOfStock
      ? AlertType.OUT_OF_STOCK
      : isLowStock
        ? AlertType.LOW_STOCK
        : null;

    if (alertType) {
      // Upsert: create or ignore if active alert already exists
      try {
        await prisma.stockAlert.create({
          data: {
            companyId: inv.companyId,
            warehouseId: inv.warehouseId,
            productId: inv.productId,
            alertType,
            currentQuantity: current,
            minimumQuantity: minimum,
            reorderQuantity: reorder,
            status: AlertStatus.ACTIVE,
          },
        });
        created++;
      } catch {
        // Unique constraint violation = alert already exists, update current qty
        await prisma.stockAlert.updateMany({
          where: {
            warehouseId: inv.warehouseId,
            productId: inv.productId,
            alertType,
            status: AlertStatus.ACTIVE,
          },
          data: { currentQuantity: current },
        });
      }
    } else {
      // Stock is healthy — resolve any active alerts for this product/warehouse
      const updated = await prisma.stockAlert.updateMany({
        where: {
          warehouseId: inv.warehouseId,
          productId: inv.productId,
          status: AlertStatus.ACTIVE,
        },
        data: { status: AlertStatus.RESOLVED, resolvedAt: new Date() },
      });
      resolved += updated.count;
    }
  }

  return { created, resolved };
}

// ── Reorder Suggestions ───────────────────────────────────────────────────────

export interface RawReorderSuggestion {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  currentQuantity: string;
  minimumQuantity: string;
  reorderQuantity: string;
  suggestedOrderQty: string;
}

export async function getReorderSuggestions(
  companyId: string,
  warehouseId?: string,
): Promise<RawReorderSuggestion[]> {
  const inventories = await prisma.inventory.findMany({
    where: {
      companyId,
      ...(warehouseId ? { warehouseId } : {}),
    },
    select: {
      productId: true,
      warehouseId: true,
      availableQuantity: true,
      minimumQuantity: true,
      reorderQuantity: true,
      product: { select: { name: true } },
      warehouse: { select: { name: true } },
    },
  });

  return inventories
    .filter((inv) => inv.availableQuantity.lte(inv.minimumQuantity))
    .map((inv) => {
      // Suggested qty = reorderQuantity - currentQuantity (at minimum top up to reorder level)
      const suggested = inv.reorderQuantity.sub(inv.availableQuantity).gt(0)
        ? inv.reorderQuantity.sub(inv.availableQuantity)
        : inv.reorderQuantity;
      return {
        productId: inv.productId,
        productName: inv.product.name,
        warehouseId: inv.warehouseId,
        warehouseName: inv.warehouse.name,
        currentQuantity: inv.availableQuantity.toString(),
        minimumQuantity: inv.minimumQuantity.toString(),
        reorderQuantity: inv.reorderQuantity.toString(),
        suggestedOrderQty: suggested.toString(),
      };
    });
}

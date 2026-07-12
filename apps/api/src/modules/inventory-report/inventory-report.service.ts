import { prisma } from '../../lib/prisma';
import { ReportsFilter } from '../reports/reports.schema';
import {
  InventoryReportItem,
  LowStockReportItem,
  StockMovementReportItem,
  BatchReportItem,
  ExpiryReportItem,
  WarehouseReportItem,
  InventoryValuationReport,
} from './inventory-report.types';
import { Prisma } from '@prisma/client';

export async function getInventoryReport(
  companyId: string,
  filter: ReportsFilter,
): Promise<{ items: InventoryReportItem[]; total: number }> {
  const invWhere: Prisma.InventoryWhereInput = {
    companyId,
    ...(filter.warehouseId ? { warehouseId: filter.warehouseId } : {}),
    ...(filter.productId ? { productId: filter.productId } : {}),
    ...(filter.search
      ? {
          OR: [
            { product: { name: { contains: filter.search, mode: 'insensitive' } } },
            { product: { sku: { contains: filter.search, mode: 'insensitive' } } },
            { warehouse: { name: { contains: filter.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.inventory.findMany({
      where: invWhere,
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
      skip,
      take: limit,
    }),
    prisma.inventory.count({ where: invWhere }),
  ]);

  const mapped: InventoryReportItem[] = items.map((item) => {
    const qty = item.availableQuantity;
    const cost = item.averageCost;
    const val = qty.mul(cost);

    return {
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku ?? 'N/A',
      warehouseName: item.warehouse.name,
      availableQuantity: qty.toString(),
      reservedQuantity: item.reservedQuantity.toString(),
      averageCost: cost.toFixed(2),
      inventoryValue: val.toFixed(2),
    };
  });

  return { items: mapped, total };
}

export async function getLowStockReport(
  companyId: string,
  filter: ReportsFilter,
): Promise<{ items: LowStockReportItem[]; total: number }> {
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  // Query inventories where availableQuantity <= minimumQuantity and > 0
  const where: Prisma.InventoryWhereInput = {
    companyId,
    ...(filter.warehouseId ? { warehouseId: filter.warehouseId } : {}),
    ...(filter.productId ? { productId: filter.productId } : {}),
    AND: [
      { availableQuantity: { gt: 0 } },
      {
        availableQuantity: {
          lte: prisma.inventory.fields.minimumQuantity,
        },
      },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
      skip,
      take: limit,
    }),
    prisma.inventory.count({ where }),
  ]);

  const mapped: LowStockReportItem[] = items.map((item) => ({
    productId: item.productId,
    productName: item.product.name,
    sku: item.product.sku ?? 'N/A',
    currentQuantity: item.availableQuantity.toString(),
    minimumQuantity: item.minimumQuantity.toString(),
    warehouseName: item.warehouse.name,
  }));

  return { items: mapped, total };
}

export async function getOutOfStockReport(
  companyId: string,
  filter: ReportsFilter,
): Promise<{ items: LowStockReportItem[]; total: number }> {
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.InventoryWhereInput = {
    companyId,
    availableQuantity: { lte: 0 },
    ...(filter.warehouseId ? { warehouseId: filter.warehouseId } : {}),
    ...(filter.productId ? { productId: filter.productId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
      skip,
      take: limit,
    }),
    prisma.inventory.count({ where }),
  ]);

  const mapped: LowStockReportItem[] = items.map((item) => ({
    productId: item.productId,
    productName: item.product.name,
    sku: item.product.sku ?? 'N/A',
    currentQuantity: item.availableQuantity.toString(),
    minimumQuantity: item.minimumQuantity.toString(),
    warehouseName: item.warehouse.name,
  }));

  return { items: mapped, total };
}

export async function getStockMovementReport(
  companyId: string,
  filter: ReportsFilter,
): Promise<{ items: StockMovementReportItem[]; total: number }> {
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.StockMovementWhereInput = {
    companyId,
    ...(filter.warehouseId ? { warehouseId: filter.warehouseId } : {}),
    ...(filter.productId ? { productId: filter.productId } : {}),
    ...(filter.startDate || filter.endDate
      ? {
          createdAt: {
            ...(filter.startDate ? { gte: filter.startDate } : {}),
            ...(filter.endDate ? { lte: filter.endDate } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.stockMovement.count({ where }),
  ]);

  const mapped: StockMovementReportItem[] = [];

  for (const movement of items) {
    const user = await prisma.user.findUnique({
      where: { id: movement.performedBy },
      select: { name: true, email: true },
    });

    mapped.push({
      id: movement.id,
      date: movement.createdAt.toISOString(),
      productName: movement.product.name,
      sku: movement.product.sku ?? 'N/A',
      warehouseName: movement.warehouse.name,
      movementType: movement.movementType,
      quantity: movement.quantity.toString(),
      user: user ? `${user.name} (${user.email})` : 'System Process',
    });
  }

  return { items: mapped, total };
}

export async function getBatchReport(
  companyId: string,
  filter: ReportsFilter,
): Promise<{ items: BatchReportItem[]; total: number }> {
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.BatchWhereInput = {
    companyId,
    ...(filter.warehouseId ? { warehouseId: filter.warehouseId } : {}),
    ...(filter.productId ? { productId: filter.productId } : {}),
    ...(filter.search
      ? {
          OR: [
            { batchNumber: { contains: filter.search, mode: 'insensitive' } },
            { product: { name: { contains: filter.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.batch.findMany({
      where,
      include: {
        product: { select: { name: true } },
      },
      skip,
      take: limit,
    }),
    prisma.batch.count({ where }),
  ]);

  const mapped: BatchReportItem[] = items.map((b) => ({
    batchNumber: b.batchNumber,
    productName: b.product.name,
    quantity: b.quantity.toString(),
    mfgDate: b.manufacturingDate
      ? (b.manufacturingDate.toISOString().split('T')[0] ?? 'N/A')
      : 'N/A',
    expiryDate: b.expiryDate ? (b.expiryDate.toISOString().split('T')[0] ?? 'N/A') : 'N/A',
  }));

  return { items: mapped, total };
}

export async function getExpiryReport(
  companyId: string,
  filter: ReportsFilter,
): Promise<{ items: ExpiryReportItem[]; total: number }> {
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  const now = new Date();
  const soonLimit = new Date();
  soonLimit.setDate(now.getDate() + 30);

  const where: Prisma.BatchWhereInput = {
    companyId,
    ...(filter.warehouseId ? { warehouseId: filter.warehouseId } : {}),
    ...(filter.productId ? { productId: filter.productId } : {}),
    expiryDate: { not: null },
  };

  // Fetch all expiry batches
  const items = await prisma.batch.findMany({
    where,
    include: {
      product: { select: { name: true } },
    },
  });

  const mapped: ExpiryReportItem[] = items
    .map((b) => {
      const exp = b.expiryDate;
      if (!exp) {
        return null;
      }
      let status: 'EXPIRED' | 'EXPIRING_SOON' | 'ACTIVE' = 'ACTIVE';

      if (exp.getTime() < now.getTime()) {
        status = 'EXPIRED';
      } else if (exp.getTime() <= soonLimit.getTime()) {
        status = 'EXPIRING_SOON';
      }

      return {
        batchNumber: b.batchNumber,
        productName: b.product.name,
        expiryDate: exp.toISOString().split('T')[0] ?? 'N/A',
        status,
      };
    })
    .filter((b): b is ExpiryReportItem => b !== null)
    .filter((b) => {
      if (filter.search === 'Expired') {
        return b.status === 'EXPIRED';
      }
      if (filter.search === 'Expiring Soon') {
        return b.status === 'EXPIRING_SOON';
      }
      return true;
    });

  const sliced = mapped.slice(skip, skip + limit);

  return { items: sliced, total: mapped.length };
}

export async function getWarehouseReport(
  companyId: string,
  filter: ReportsFilter,
): Promise<{ items: WarehouseReportItem[]; total: number }> {
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.WarehouseWhereInput = {
    companyId,
    ...(filter.warehouseId ? { id: filter.warehouseId } : {}),
  };

  const [warehouses, total] = await Promise.all([
    prisma.warehouse.findMany({
      where,
      include: {
        inventories: {
          include: { product: { select: { id: true } } },
        },
      },
      skip,
      take: limit,
    }),
    prisma.warehouse.count({ where }),
  ]);

  const mapped: WarehouseReportItem[] = [];

  for (const w of warehouses) {
    let totalQty = new Prisma.Decimal(0);
    let totalVal = new Prisma.Decimal(0);
    const prodIds = new Set<string>();

    for (const item of w.inventories) {
      prodIds.add(item.productId);
      totalQty = totalQty.add(item.availableQuantity);
      totalVal = totalVal.add(item.availableQuantity.mul(item.averageCost));
    }

    mapped.push({
      warehouseName: w.name,
      totalProducts: prodIds.size,
      totalQuantity: totalQty.toString(),
      inventoryValue: totalVal.toFixed(2),
    });
  }

  return { items: mapped, total };
}

export async function getInventoryValuation(
  companyId: string,
  filter: ReportsFilter,
): Promise<InventoryValuationReport> {
  const where: Prisma.WarehouseWhereInput = {
    companyId,
    ...(filter.warehouseId ? { id: filter.warehouseId } : {}),
  };

  const warehouses = await prisma.warehouse.findMany({
    where,
    include: {
      inventories: true,
    },
  });

  const warehouseValue: { warehouseId: string; warehouseName: string; value: string }[] = [];
  let overall = new Prisma.Decimal(0);

  for (const w of warehouses) {
    let wVal = new Prisma.Decimal(0);
    for (const item of w.inventories) {
      wVal = wVal.add(item.availableQuantity.mul(item.averageCost));
    }
    overall = overall.add(wVal);

    warehouseValue.push({
      warehouseId: w.id,
      warehouseName: w.name,
      value: wVal.toFixed(2),
    });
  }

  return {
    inventoryValue: overall.toFixed(2),
    warehouseValue,
    overallValue: overall.toFixed(2),
  };
}

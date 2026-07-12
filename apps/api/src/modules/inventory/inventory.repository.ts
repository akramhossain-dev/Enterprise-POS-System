// ─────────────────────────────────────────────
// Inventory Module — Repository
// ─────────────────────────────────────────────

import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { InventoryListOptions, OpeningStockInput } from './inventory.types';
import { UpdateMinStockBody, UpdateReorderLevelBody } from './inventory.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaInventoryWithRelations } from './inventory.mapper';

// ── Shared select ──────────────────────────────────────────────────────────────

const INVENTORY_SELECT = {
  id: true,
  companyId: true,
  warehouseId: true,
  productId: true,
  availableQuantity: true,
  reservedQuantity: true,
  damagedQuantity: true,
  minimumQuantity: true,
  reorderQuantity: true,
  maximumQuantity: true,
  averageCost: true,
  lastPurchasePrice: true,
  hasOpeningStock: true,
  createdAt: true,
  updatedAt: true,
  product: {
    select: { id: true, name: true, sku: true, barcode: true, status: true },
  },
  warehouse: {
    select: { id: true, name: true, code: true },
  },
} satisfies Prisma.InventorySelect;

// ── List ───────────────────────────────────────────────────────────────────────

export async function findInventories(options: InventoryListOptions): Promise<{
  inventories: PrismaInventoryWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: options.page ?? 1, limit: options.limit ?? 20 });

  const where: Prisma.InventoryWhereInput = {
    ...(options.companyId ? { companyId: options.companyId } : {}),
    ...(options.warehouseId ? { warehouseId: options.warehouseId } : {}),
    ...(options.outOfStock === true
      ? { availableQuantity: { equals: 0 } }
      : options.lowStock === true
        ? {
            AND: [
              { availableQuantity: { gt: 0 } },
              { availableQuantity: { lt: prisma.inventory.fields.minimumQuantity } },
            ],
          }
        : {}),
    ...(options.q
      ? {
          product: {
            OR: [
              { name: { contains: options.q, mode: 'insensitive' } },
              { sku: { contains: options.q, mode: 'insensitive' } },
              { barcode: { contains: options.q, mode: 'insensitive' } },
            ],
          },
        }
      : {}),
  };

  const allowedSort: Record<string, true> = {
    availableQuantity: true,
    updatedAt: true,
    createdAt: true,
  };
  const sortField =
    options.sortBy !== undefined && allowedSort[options.sortBy] ? options.sortBy : 'updatedAt';
  const orderBy: Prisma.InventoryOrderByWithRelationInput = {
    [sortField]: options.sortOrder ?? 'desc',
  };

  const [inventories, total] = await prisma.$transaction([
    prisma.inventory.findMany({ where, select: INVENTORY_SELECT, orderBy, skip, take }),
    prisma.inventory.count({ where }),
  ]);

  return {
    inventories: inventories as unknown as PrismaInventoryWithRelations[],
    meta: buildPaginationMeta(options.page ?? 1, options.limit ?? 20, total),
  };
}

// ── Find by ID ─────────────────────────────────────────────────────────────────

export async function findInventoryById(id: string): Promise<PrismaInventoryWithRelations | null> {
  const inv = await prisma.inventory.findUnique({
    where: { id },
    select: INVENTORY_SELECT,
  });
  return inv;
}

// ── Find by product + warehouse ────────────────────────────────────────────────

export async function findInventoryByProductWarehouse(
  productId: string,
  warehouseId: string,
): Promise<PrismaInventoryWithRelations | null> {
  const inv = await prisma.inventory.findUnique({
    where: { warehouseId_productId: { warehouseId, productId } },
    select: INVENTORY_SELECT,
  });
  return inv;
}

// ── Find by product (all warehouses) ──────────────────────────────────────────

export async function findInventoriesByProduct(
  productId: string,
): Promise<PrismaInventoryWithRelations[]> {
  const inventories = await prisma.inventory.findMany({
    where: { productId },
    select: INVENTORY_SELECT,
    orderBy: { updatedAt: 'desc' },
  });
  return inventories;
}

// ── Find by warehouse (all products) ──────────────────────────────────────────

export async function findInventoriesByWarehouse(
  warehouseId: string,
): Promise<PrismaInventoryWithRelations[]> {
  const inventories = await prisma.inventory.findMany({
    where: { warehouseId },
    select: INVENTORY_SELECT,
    orderBy: { updatedAt: 'desc' },
  });
  return inventories;
}

// ── Create Opening Stock ───────────────────────────────────────────────────────

export async function createOpeningStock(
  data: OpeningStockInput,
): Promise<PrismaInventoryWithRelations> {
  const inv = await prisma.inventory.create({
    data: {
      companyId: data.companyId,
      warehouseId: data.warehouseId,
      productId: data.productId,
      availableQuantity: data.quantity,
      averageCost: data.averageCost,
      lastPurchasePrice: data.averageCost,
      minimumQuantity: data.minimumQuantity,
      reorderQuantity: data.reorderQuantity,
      ...(data.maximumQuantity !== undefined ? { maximumQuantity: data.maximumQuantity } : {}),
      hasOpeningStock: true,
    },
    select: INVENTORY_SELECT,
  });
  return inv;
}

// ── Update Min Stock ───────────────────────────────────────────────────────────

export async function updateMinStock(
  data: UpdateMinStockBody,
): Promise<PrismaInventoryWithRelations> {
  const updateData: Prisma.InventoryUpdateInput = {
    minimumQuantity: data.minimumQuantity,
    ...(data.reorderQuantity !== undefined ? { reorderQuantity: data.reorderQuantity } : {}),
    ...(data.maximumQuantity !== undefined ? { maximumQuantity: data.maximumQuantity } : {}),
  };

  const inv = await prisma.inventory.update({
    where: { id: data.inventoryId },
    data: updateData,
    select: INVENTORY_SELECT,
  });
  return inv;
}

// ── Update Reorder Level ───────────────────────────────────────────────────────

export async function updateReorderLevel(
  data: UpdateReorderLevelBody,
): Promise<PrismaInventoryWithRelations> {
  const inv = await prisma.inventory.update({
    where: { id: data.inventoryId },
    data: { reorderQuantity: data.reorderQuantity },
    select: INVENTORY_SELECT,
  });
  return inv;
}

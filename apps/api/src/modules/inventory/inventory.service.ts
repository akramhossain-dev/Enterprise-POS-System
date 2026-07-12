// ─────────────────────────────────────────────
// Inventory Module — Service Layer
// ─────────────────────────────────────────────

import { ConflictError, NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import {
  OpeningStockBody,
  UpdateMinStockBody,
  UpdateReorderLevelBody,
  InventoryQuery,
} from './inventory.schema';
import {
  findInventories,
  findInventoryById as repoFindById,
  findInventoryByProductWarehouse,
  findInventoriesByProduct,
  findInventoriesByWarehouse,
  updateMinStock as repoUpdateMinStock,
  updateReorderLevel as repoUpdateReorderLevel,
} from './inventory.repository';
import { mapInventory, mapInventoryList, MappedInventory } from './inventory.mapper';
import { findWarehouseById } from '../warehouse/warehouse.repository';
import { prisma } from '../../lib/prisma';
import { MovementType } from '@prisma/client';

// ── List ───────────────────────────────────────────────────────────────────────

export async function listInventories(query: InventoryQuery): Promise<{
  inventories: MappedInventory[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { inventories, meta } = await findInventories(query);
  return { inventories: mapInventoryList(inventories), meta };
}

// ── Get by ID ──────────────────────────────────────────────────────────────────

export async function getInventoryById(id: string): Promise<MappedInventory> {
  const inv = await repoFindById(id);
  if (!inv) {
    throw new NotFoundError(`Inventory record with ID "${id}" not found`);
  }
  return mapInventory(inv);
}

// ── Get by product ─────────────────────────────────────────────────────────────

export async function getInventoryByProduct(productId: string): Promise<MappedInventory[]> {
  const inventories = await findInventoriesByProduct(productId);
  return mapInventoryList(inventories);
}

// ── Get by warehouse ───────────────────────────────────────────────────────────

export async function getInventoryByWarehouse(warehouseId: string): Promise<MappedInventory[]> {
  const wh = await findWarehouseById(warehouseId);
  if (!wh) {
    throw new NotFoundError(`Warehouse with ID "${warehouseId}" not found`);
  }
  const inventories = await findInventoriesByWarehouse(warehouseId);
  return mapInventoryList(inventories);
}

// ── Opening Stock ──────────────────────────────────────────────────────────────
// Creates inventory record + OPENING_STOCK movement in a single Prisma transaction.

export async function addOpeningStock(
  body: OpeningStockBody,
  actorId: string,
): Promise<MappedInventory> {
  // Guard — warehouse must exist
  const wh = await findWarehouseById(body.warehouseId);
  if (!wh) {
    throw new NotFoundError(`Warehouse with ID "${body.warehouseId}" not found`);
  }

  // Guard — product must exist
  const product = await prisma.product.findFirst({
    where: { id: body.productId },
    select: { id: true, name: true },
  });
  if (!product) {
    throw new NotFoundError(`Product with ID "${body.productId}" not found`);
  }

  // Guard — opening stock can only be added once per product+warehouse
  const existing = await findInventoryByProductWarehouse(body.productId, body.warehouseId);
  if (existing) {
    throw new ConflictError(
      `Opening stock for product "${product.name}" in warehouse "${wh.name}" already exists. ` +
        `Use the Stock Adjustment module for further stock changes.`,
    );
  }

  const inv = await prisma.$transaction(async (tx) => {
    // 1. Create inventory record with initial quantity
    const created = await tx.inventory.create({
      data: {
        companyId: body.companyId,
        warehouseId: body.warehouseId,
        productId: body.productId,
        availableQuantity: body.quantity,
        averageCost: body.averageCost,
        lastPurchasePrice: body.averageCost,
        minimumQuantity: body.minimumQuantity,
        reorderQuantity: body.reorderQuantity,
        ...(body.maximumQuantity !== undefined ? { maximumQuantity: body.maximumQuantity } : {}),
        hasOpeningStock: true,
      },
      select: {
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
        product: { select: { id: true, name: true, sku: true, barcode: true, status: true } },
        warehouse: { select: { id: true, name: true, code: true } },
      },
    });

    // 2. Create OPENING_STOCK movement record
    const movement = await tx.stockMovement.create({
      data: {
        companyId: body.companyId,
        warehouseId: body.warehouseId,
        productId: body.productId,
        movementType: MovementType.OPENING_STOCK,
        quantity: body.quantity,
        previousQuantity: 0,
        newQuantity: body.quantity,
        ...(body.averageCost > 0 ? { unitCost: body.averageCost } : {}),
        referenceType: 'INVENTORY',
        referenceId: created.id,
        remarks: 'Initial opening stock',
        performedBy: actorId,
      },
      select: { id: true },
    });

    // 3. Create InventoryLedger entry (B7.3)
    await tx.inventoryLedger.create({
      data: {
        companyId: body.companyId,
        warehouseId: body.warehouseId,
        productId: body.productId,
        movementId: movement.id,
        runningQuantity: body.quantity,
        runningValue: body.quantity * body.averageCost,
      },
    });

    return created;
  });

  return mapInventory(inv);
}

// ── Update Min Stock ───────────────────────────────────────────────────────────

export async function updateMinStock(
  body: UpdateMinStockBody,
  actorId: string,
): Promise<MappedInventory> {
  void actorId;
  const existing = await repoFindById(body.inventoryId);
  if (!existing) {
    throw new NotFoundError(`Inventory record with ID "${body.inventoryId}" not found`);
  }
  const updated = await repoUpdateMinStock(body);
  return mapInventory(updated);
}

// ── Update Reorder Level ───────────────────────────────────────────────────────

export async function updateReorderLevel(
  body: UpdateReorderLevelBody,
  actorId: string,
): Promise<MappedInventory> {
  void actorId;
  const existing = await repoFindById(body.inventoryId);
  if (!existing) {
    throw new NotFoundError(`Inventory record with ID "${body.inventoryId}" not found`);
  }
  const updated = await repoUpdateReorderLevel(body);
  return mapInventory(updated);
}

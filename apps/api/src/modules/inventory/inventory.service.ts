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
  createOpeningStock as repoCreateOpening,
  updateMinStock as repoUpdateMinStock,
  updateReorderLevel as repoUpdateReorderLevel,
} from './inventory.repository';
import { mapInventory, mapInventoryList, MappedInventory } from './inventory.mapper';
import { InventoryAuditPayload } from './inventory.types';
import { findWarehouseById } from '../warehouse/warehouse.repository';
import { prisma } from '../../lib/prisma';

// ── Audit stub ─────────────────────────────────────────────────────────────────

async function emitAuditEvent(payload: InventoryAuditPayload): Promise<void> {
  // TODO: Phase B_AUDIT — wire to AuditLogService.record(payload)
  void payload;
  await Promise.resolve();
}

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
      `Opening stock for product "${product.name}" in warehouse "${wh.name}" already exists. Stock movements should go through B7.2 Stock Movement module.`,
    );
  }

  const inv = await repoCreateOpening({
    companyId: body.companyId,
    warehouseId: body.warehouseId,
    productId: body.productId,
    quantity: body.quantity,
    averageCost: body.averageCost,
    minimumQuantity: body.minimumQuantity,
    reorderQuantity: body.reorderQuantity,
    ...(body.maximumQuantity !== undefined ? { maximumQuantity: body.maximumQuantity } : {}),
  });

  await emitAuditEvent({
    actorId,
    inventoryId: inv.id,
    productId: inv.productId,
    warehouseId: inv.warehouseId,
    action: 'OPENING_STOCK',
    changes: { quantity: body.quantity, averageCost: body.averageCost },
  });

  return mapInventory(inv);
}

// ── Update Min Stock ───────────────────────────────────────────────────────────

export async function updateMinStock(
  body: UpdateMinStockBody,
  actorId: string,
): Promise<MappedInventory> {
  const existing = await repoFindById(body.inventoryId);
  if (!existing) {
    throw new NotFoundError(`Inventory record with ID "${body.inventoryId}" not found`);
  }

  const updated = await repoUpdateMinStock(body);

  await emitAuditEvent({
    actorId,
    inventoryId: updated.id,
    productId: updated.productId,
    warehouseId: updated.warehouseId,
    action: 'STOCK_UPDATED',
    changes: { minimumQuantity: body.minimumQuantity, reorderQuantity: body.reorderQuantity },
  });

  return mapInventory(updated);
}

// ── Update Reorder Level ───────────────────────────────────────────────────────

export async function updateReorderLevel(
  body: UpdateReorderLevelBody,
  actorId: string,
): Promise<MappedInventory> {
  const existing = await repoFindById(body.inventoryId);
  if (!existing) {
    throw new NotFoundError(`Inventory record with ID "${body.inventoryId}" not found`);
  }

  const updated = await repoUpdateReorderLevel(body);

  await emitAuditEvent({
    actorId,
    inventoryId: updated.id,
    productId: updated.productId,
    warehouseId: updated.warehouseId,
    action: 'STOCK_UPDATED',
    changes: { reorderQuantity: body.reorderQuantity },
  });

  return mapInventory(updated);
}

// ── Future stubs (DO NOT implement) ───────────────────────────────────────────
// adjustStock(inventoryId, qty, reason)     — Phase: B7.2 Stock Movement
// transferStock(fromWH, toWH, productId)    — Phase: Transfer
// reserveStock(inventoryId, qty, saleId)    — Phase: Sales
// releaseReservation(inventoryId, qty)      — Phase: Sales
// processReturn(inventoryId, qty, reason)   — Phase: Returns

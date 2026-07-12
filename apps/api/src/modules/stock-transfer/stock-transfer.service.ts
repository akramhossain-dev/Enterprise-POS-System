// ─────────────────────────────────────────────
// Stock Transfer Module — Service
// ─────────────────────────────────────────────
//
// Business Rules:
// - PENDING → APPROVED → COMPLETED (normal path)
// - PENDING → REJECTED (rejection path)
// - APPROVED → REJECTED is NOT allowed
// - On COMPLETE: apply TRANSFER_OUT (from) + TRANSFER_IN (to) per item
// - Both movements in a single transaction
// - Prevent duplicate product in items (handled in schema)
// - Prevent same warehouse (handled in schema)
// ─────────────────────────────────────────────

import { MovementType, TransferStatus } from '@prisma/client';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors/AppError';
import { prisma } from '../../lib/prisma';
import { buildPaginationMeta } from '../../common/utils/query';
import { CreateTransferBody, TransferQuery } from './stock-transfer.schema';
import {
  createTransferRecord,
  findTransferById,
  findTransfers,
  updateTransferStatus,
} from './stock-transfer.repository';
import { mapTransfer, mapTransferList, MappedStockTransfer } from './stock-transfer.mapper';
import { applyStockOperation } from '../stock-movement/stock-movement.engine';
import { findWarehouseById } from '../warehouse/warehouse.repository';

// ── Create Transfer ────────────────────────────────────────────────────────────

export async function createStockTransfer(
  body: CreateTransferBody,
  actorId: string,
): Promise<MappedStockTransfer> {
  // Warehouse existence checks
  const fromWh = await findWarehouseById(body.fromWarehouseId);
  if (!fromWh) {
    throw new NotFoundError(`Source warehouse "${body.fromWarehouseId}" not found`);
  }

  const toWh = await findWarehouseById(body.toWarehouseId);
  if (!toWh) {
    throw new NotFoundError(`Destination warehouse "${body.toWarehouseId}" not found`);
  }

  // Product existence checks
  const productIds = body.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const foundProductIds = new Set(products.map((p) => p.id));
  const missingProducts = productIds.filter((id) => !foundProductIds.has(id));
  if (missingProducts.length > 0) {
    throw new NotFoundError(`Products not found: ${missingProducts.join(', ')}`);
  }

  const transfer = await prisma.$transaction(async (tx) => {
    return createTransferRecord(tx, {
      companyId: body.companyId,
      fromWarehouseId: body.fromWarehouseId,
      toWarehouseId: body.toWarehouseId,
      remarks: body.remarks,
      createdBy: actorId,
      items: body.items,
    });
  });

  return mapTransfer(transfer);
}

// ── Approve Transfer ───────────────────────────────────────────────────────────

export async function approveTransfer(id: string, actorId: string): Promise<MappedStockTransfer> {
  const transfer = await findTransferById(id);
  if (!transfer) {
    throw new NotFoundError(`Stock transfer "${id}" not found`);
  }

  if (transfer.status !== TransferStatus.PENDING) {
    throw new ConflictError(
      `Transfer can only be approved when status is PENDING. Current: ${transfer.status}`,
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    return updateTransferStatus(tx, id, TransferStatus.APPROVED, actorId);
  });

  return mapTransfer(updated);
}

// ── Reject Transfer ────────────────────────────────────────────────────────────

export async function rejectTransfer(id: string, actorId: string): Promise<MappedStockTransfer> {
  const transfer = await findTransferById(id);
  if (!transfer) {
    throw new NotFoundError(`Stock transfer "${id}" not found`);
  }

  if (transfer.status !== TransferStatus.PENDING) {
    throw new ConflictError(
      `Transfer can only be rejected when status is PENDING. Current: ${transfer.status}`,
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    return updateTransferStatus(tx, id, TransferStatus.REJECTED, actorId);
  });

  return mapTransfer(updated);
}

// ── Complete Transfer ──────────────────────────────────────────────────────────
//
// This is the critical operation:
// - Status must be APPROVED
// - For each item:
//   1. TRANSFER_OUT from source warehouse (decreases stock)
//   2. TRANSFER_IN to destination warehouse (increases stock)
// - All within ONE transaction — if any step fails, ROLLBACK

export async function completeTransfer(id: string, actorId: string): Promise<MappedStockTransfer> {
  const transfer = await findTransferById(id);
  if (!transfer) {
    throw new NotFoundError(`Stock transfer "${id}" not found`);
  }

  if (transfer.status !== TransferStatus.APPROVED) {
    throw new ConflictError(
      `Transfer can only be completed when status is APPROVED. Current: ${transfer.status}`,
    );
  }

  if (transfer.items.length === 0) {
    throw new BadRequestError(`Transfer has no items to process`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Process each item: TRANSFER_OUT then TRANSFER_IN
    for (const item of transfer.items) {
      const qty = Number(item.quantity);

      // 1. TRANSFER_OUT — deduct from source warehouse
      await applyStockOperation(tx, {
        companyId: transfer.companyId,
        warehouseId: transfer.fromWarehouseId,
        productId: item.productId,
        movementType: MovementType.TRANSFER_OUT,
        quantity: qty,
        referenceType: 'TRANSFER',
        referenceId: transfer.id,
        remarks: `Transfer to ${transfer.toWarehouse.name} (${transfer.toWarehouse.code})`,
        performedBy: actorId,
      });

      // 2. TRANSFER_IN — add to destination warehouse
      //    NOTE: destination warehouse may not have an inventory record yet.
      //    We handle this by upserting below.
      const destInventory = await tx.inventory.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: transfer.toWarehouseId,
            productId: item.productId,
          },
        },
        select: { id: true },
      });

      if (!destInventory) {
        // Auto-create inventory record at destination (0 stock before transfer)
        await tx.inventory.create({
          data: {
            companyId: transfer.companyId,
            warehouseId: transfer.toWarehouseId,
            productId: item.productId,
            availableQuantity: 0,
            hasOpeningStock: false,
          },
        });
      }

      await applyStockOperation(tx, {
        companyId: transfer.companyId,
        warehouseId: transfer.toWarehouseId,
        productId: item.productId,
        movementType: MovementType.TRANSFER_IN,
        quantity: qty,
        referenceType: 'TRANSFER',
        referenceId: transfer.id,
        remarks: `Transfer from ${transfer.fromWarehouse.name} (${transfer.fromWarehouse.code})`,
        performedBy: actorId,
      });
    }

    // Mark transfer as COMPLETED
    return updateTransferStatus(tx, id, TransferStatus.COMPLETED, actorId);
  });

  return mapTransfer(updated);
}

// ── List Transfers ─────────────────────────────────────────────────────────────

export async function listTransfers(query: TransferQuery): Promise<{
  transfers: MappedStockTransfer[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { transfers, meta } = await findTransfers(query);
  return { transfers: mapTransferList(transfers), meta };
}

// ── Get by ID ──────────────────────────────────────────────────────────────────

export async function getTransferById(id: string): Promise<MappedStockTransfer> {
  const t = await findTransferById(id);
  if (!t) {
    throw new NotFoundError(`Stock transfer "${id}" not found`);
  }
  return mapTransfer(t);
}

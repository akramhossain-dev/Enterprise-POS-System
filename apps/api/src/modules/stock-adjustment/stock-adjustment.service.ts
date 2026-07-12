// ─────────────────────────────────────────────
// Stock Adjustment Module — Service
// ─────────────────────────────────────────────

import { AdjustmentType, MovementType } from '@prisma/client';
import { NotFoundError } from '../../common/errors/AppError';
import { prisma } from '../../lib/prisma';
import { buildPaginationMeta } from '../../common/utils/query';
import { CreateAdjustmentBody, AdjustmentQuery } from './stock-adjustment.schema';
import {
  createAdjustmentRecord,
  findAdjustments,
  findAdjustmentById,
} from './stock-adjustment.repository';
import { mapAdjustment, mapAdjustmentList, MappedStockAdjustment } from './stock-adjustment.mapper';
import { applyStockOperation } from '../stock-movement/stock-movement.engine';
import { findWarehouseById } from '../warehouse/warehouse.repository';

// ── Adjustment type → MovementType mapping ─────────────────────────────────────

const ADJUSTMENT_TO_MOVEMENT: Record<AdjustmentType, MovementType> = {
  [AdjustmentType.INCREASE]: MovementType.ADJUSTMENT_IN,
  [AdjustmentType.DECREASE]: MovementType.ADJUSTMENT_OUT,
  [AdjustmentType.DAMAGE]: MovementType.DAMAGE,
  [AdjustmentType.EXPIRED]: MovementType.EXPIRED,
  [AdjustmentType.LOST]: MovementType.LOST,
};

// ── Create Adjustment (full transaction) ──────────────────────────────────────

export async function createStockAdjustment(
  body: CreateAdjustmentBody,
  actorId: string,
): Promise<MappedStockAdjustment> {
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

  const movementType = ADJUSTMENT_TO_MOVEMENT[body.type];

  const adjustment = await prisma.$transaction(async (tx) => {
    // 1. Create adjustment record
    const adj = await createAdjustmentRecord(tx, {
      companyId: body.companyId,
      warehouseId: body.warehouseId,
      productId: body.productId,
      type: body.type,
      quantity: body.quantity,
      reason: body.reason,
      remarks: body.remarks,
      createdBy: actorId,
      approvedBy: actorId, // auto-approved by the executing user
    });

    // 2. Apply stock operation via engine (updates inventory + creates StockMovement)
    await applyStockOperation(tx, {
      companyId: body.companyId,
      warehouseId: body.warehouseId,
      productId: body.productId,
      movementType,
      quantity: body.quantity,
      unitCost: body.unitCost,
      referenceType: 'ADJUSTMENT',
      referenceId: adj.id,
      remarks: `${body.type} — ${body.reason}`,
      performedBy: actorId,
    });

    return adj;
  });

  return mapAdjustment(adjustment);
}

// ── List Adjustments ───────────────────────────────────────────────────────────

export async function listAdjustments(query: AdjustmentQuery): Promise<{
  adjustments: MappedStockAdjustment[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { adjustments, meta } = await findAdjustments(query);
  return { adjustments: mapAdjustmentList(adjustments), meta };
}

// ── Get by ID ──────────────────────────────────────────────────────────────────

export async function getAdjustmentById(id: string): Promise<MappedStockAdjustment> {
  const a = await findAdjustmentById(id);
  if (!a) {
    throw new NotFoundError(`Stock adjustment with ID "${id}" not found`);
  }
  return mapAdjustment(a);
}

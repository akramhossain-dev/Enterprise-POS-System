// ─────────────────────────────────────────────
// Reconciliation Service
//
// Key logic:
// On APPROVE:
//   - For each item with non-zero variance:
//     - variance > 0 → ADJUSTMENT_IN (physical > system)
//     - variance < 0 → ADJUSTMENT_OUT (physical < system)
//   - Creates both StockAdjustment + StockMovement records
//   - All in a single transaction
// ─────────────────────────────────────────────

import {
  AdjustmentType,
  MovementType,
  ReconciliationStatus,
  StockTakeStatus,
} from '@prisma/client';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import {
  CreateReconciliationBody,
  ApproveReconciliationBody,
  ReconciliationQuery,
} from './reconciliation.schema';
import {
  findReconciliations,
  findReconciliationById,
  findReconciliationByStockTakeId,
  createReconciliation,
  updateReconciliationStatus,
} from './reconciliation.repository';
import {
  mapReconciliation,
  mapReconciliationList,
  MappedReconciliation,
} from './reconciliation.mapper';
import { prisma } from '../../lib/prisma';
import { applyStockOperation } from '../stock-movement/stock-movement.engine';

const VARIANCE_TO_ADJUSTMENT: Record<
  'INCREASE' | 'DECREASE',
  { adj: AdjustmentType; mov: MovementType }
> = {
  INCREASE: { adj: AdjustmentType.INCREASE, mov: MovementType.ADJUSTMENT_IN },
  DECREASE: { adj: AdjustmentType.DECREASE, mov: MovementType.ADJUSTMENT_OUT },
};

export async function createRecon(
  body: CreateReconciliationBody,
  actorId: string,
): Promise<MappedReconciliation> {
  // Stock take must exist and be COMPLETED
  const stockTake = await prisma.stockTake.findUnique({
    where: { id: body.stockTakeId },
    select: { id: true, status: true, companyId: true },
  });
  if (!stockTake) {
    throw new NotFoundError(`Stock take "${body.stockTakeId}" not found`);
  }
  if (stockTake.status !== StockTakeStatus.COMPLETED) {
    throw new BadRequestError(
      `Stock take must be COMPLETED to reconcile. Current: ${stockTake.status}`,
    );
  }

  // Prevent duplicate reconciliation
  const existing = await findReconciliationByStockTakeId(body.stockTakeId);
  if (existing) {
    throw new ConflictError(`Reconciliation already exists for this stock take`);
  }

  const recon = await createReconciliation(
    body.stockTakeId,
    stockTake.companyId,
    actorId,
    body.remarks,
  );
  return mapReconciliation(recon);
}

export async function approveRecon(
  id: string,
  body: ApproveReconciliationBody,
  actorId: string,
): Promise<MappedReconciliation> {
  const recon = await findReconciliationById(id);
  if (!recon) {
    throw new NotFoundError(`Reconciliation "${id}" not found`);
  }
  if (recon.status !== ReconciliationStatus.PENDING) {
    throw new ConflictError(`Reconciliation must be PENDING to approve. Current: ${recon.status}`);
  }

  const stockTake = recon.stockTake;
  const companyId = recon.companyId;
  const warehouseId = stockTake.warehouseId;

  // Build list of variance items (only non-zero variances)
  const varianceItems = stockTake.items.filter(
    (i) => i.physicalQuantity !== null && i.variance !== null && !i.variance.isZero(),
  );

  const updated = await prisma.$transaction(async (tx) => {
    for (const item of varianceItems) {
      const varianceNum = Number((item.variance ?? item.systemQuantity).toString());
      const direction = varianceNum > 0 ? 'INCREASE' : 'DECREASE';
      const qty = Math.abs(varianceNum);
      const { adj, mov } = VARIANCE_TO_ADJUSTMENT[direction];

      // Create StockAdjustment record
      const adjRecord = await tx.stockAdjustment.create({
        data: {
          companyId,
          warehouseId,
          productId: item.productId,
          type: adj,
          quantity: qty,
          reason: `Reconciliation adjustment from stock take`,
          createdBy: actorId,
          approvedBy: actorId,
        },
        select: { id: true },
      });

      // Apply stock movement via engine
      await applyStockOperation(tx, {
        companyId,
        warehouseId,
        productId: item.productId,
        movementType: mov,
        quantity: qty,
        referenceType: 'RECONCILIATION',
        referenceId: id,
        remarks: `Reconciliation: ${direction} by ${String(qty)}`,
        performedBy: actorId,
      });

      void adjRecord;
    }

    // Update reconciliation status
    return updateReconciliationStatus(id, ReconciliationStatus.APPROVED, actorId, body.remarks);
  });

  return mapReconciliation(updated);
}

export async function rejectRecon(
  id: string,
  body: ApproveReconciliationBody,
  actorId: string,
): Promise<MappedReconciliation> {
  const recon = await findReconciliationById(id);
  if (!recon) {
    throw new NotFoundError(`Reconciliation "${id}" not found`);
  }
  if (recon.status !== ReconciliationStatus.PENDING) {
    throw new ConflictError(`Reconciliation must be PENDING to reject. Current: ${recon.status}`);
  }
  void actorId;
  const updated = await updateReconciliationStatus(
    id,
    ReconciliationStatus.REJECTED,
    undefined,
    body.remarks,
  );
  return mapReconciliation(updated);
}

export async function listRecons(query: ReconciliationQuery): Promise<{
  reconciliations: MappedReconciliation[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { recons, meta } = await findReconciliations(query);
  return { reconciliations: mapReconciliationList(recons), meta };
}

export async function getReconById(id: string): Promise<MappedReconciliation> {
  const r = await findReconciliationById(id);
  if (!r) {
    throw new NotFoundError(`Reconciliation "${id}" not found`);
  }
  return mapReconciliation(r);
}

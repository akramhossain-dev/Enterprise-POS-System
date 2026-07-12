// ─────────────────────────────────────────────
// Stock Movement Engine — Core Transaction Logic
// ─────────────────────────────────────────────
//
// This is the SINGLE entry point for ALL inventory changes.
// Every stock mutation MUST go through this engine.
// Direct Inventory table writes are FORBIDDEN outside this file.
// ─────────────────────────────────────────────

import { Prisma, MovementType } from '@prisma/client';
import { BadRequestError } from '../../common/errors/AppError';

// ── Prisma transaction client type ────────────────────────────────────────────

export type PrismaTransactionClient = Omit<
  InstanceType<typeof import('@prisma/client').PrismaClient>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// ── Inbound vs Outbound movement classification ───────────────────────────────

const INBOUND_TYPES = new Set<MovementType>([
  MovementType.OPENING_STOCK,
  MovementType.PURCHASE,
  MovementType.SALE_RETURN,
  MovementType.TRANSFER_IN,
  MovementType.ADJUSTMENT_IN,
]);

const OUTBOUND_TYPES = new Set<MovementType>([
  MovementType.PURCHASE_RETURN,
  MovementType.SALE,
  MovementType.TRANSFER_OUT,
  MovementType.ADJUSTMENT_OUT,
  MovementType.DAMAGE,
  MovementType.EXPIRED,
  MovementType.LOST,
  MovementType.MANUAL,
]);

export function isInbound(type: MovementType): boolean {
  return INBOUND_TYPES.has(type);
}

export function isOutbound(type: MovementType): boolean {
  return OUTBOUND_TYPES.has(type);
}

// ── Engine parameters ─────────────────────────────────────────────────────────

export interface StockEngineParams {
  companyId: string;
  branchId?: string | undefined;
  warehouseId: string;
  productId: string;
  movementType: MovementType;
  /** Always a positive number. Direction is determined by movementType. */
  quantity: number;
  unitCost?: number | undefined;
  referenceType?: string | undefined;
  referenceId?: string | undefined;
  remarks?: string | undefined;
  performedBy: string;
}

export interface StockEngineResult {
  movementId: string;
  previousQuantity: Prisma.Decimal;
  newQuantity: Prisma.Decimal;
  updatedInventoryId: string;
}

// ── Core engine function ───────────────────────────────────────────────────────

/**
 * Applies a stock operation atomically within a Prisma transaction.
 *
 * Steps:
 * 1. Locks the inventory record (read within tx)
 * 2. Calculates new quantity
 * 3. Guards against negative stock
 * 4. Updates inventory summary (availableQuantity, damagedQuantity, averageCost)
 * 5. Creates a StockMovement audit record
 * 6. Returns result for caller to use
 */
export async function applyStockOperation(
  tx: PrismaTransactionClient,
  params: StockEngineParams,
): Promise<StockEngineResult> {
  const {
    companyId,
    branchId,
    warehouseId,
    productId,
    movementType,
    quantity,
    unitCost,
    referenceType,
    referenceId,
    remarks,
    performedBy,
  } = params;

  if (quantity <= 0) {
    throw new BadRequestError(`Quantity must be greater than 0. Received: ${String(quantity)}`);
  }

  // ── Step 1: Lock inventory record within transaction ───────────────────────

  const inventory = await tx.inventory.findUnique({
    where: { warehouseId_productId: { warehouseId, productId } },
    select: {
      id: true,
      availableQuantity: true,
      damagedQuantity: true,
      averageCost: true,
      lastPurchasePrice: true,
    },
  });

  if (!inventory) {
    throw new BadRequestError(
      `No inventory record found for product in this warehouse. ` +
        `Run opening stock first (POST /inventory/opening-stock).`,
    );
  }

  const prevQty = inventory.availableQuantity;
  const qtyDecimal = new Prisma.Decimal(quantity);

  // ── Step 2: Determine new quantity ────────────────────────────────────────

  let newQty: Prisma.Decimal;
  let newDamagedQty = inventory.damagedQuantity;
  let newAverageCost = inventory.averageCost;

  if (isInbound(movementType)) {
    newQty = prevQty.add(qtyDecimal);

    // Recalculate weighted average cost for inbound with cost
    if (unitCost !== undefined && unitCost > 0 && prevQty.gte(0)) {
      const costDecimal = new Prisma.Decimal(unitCost);
      const totalExistingValue = prevQty.mul(inventory.averageCost);
      const totalNewValue = qtyDecimal.mul(costDecimal);
      const totalQty = prevQty.add(qtyDecimal);
      if (totalQty.gt(0)) {
        newAverageCost = totalExistingValue.add(totalNewValue).div(totalQty);
      }
    }
  } else if (isOutbound(movementType)) {
    newQty = prevQty.sub(qtyDecimal);

    // Track damaged quantity separately
    if (movementType === MovementType.DAMAGE) {
      newDamagedQty = inventory.damagedQuantity.add(qtyDecimal);
    }
  } else {
    throw new BadRequestError(`Unknown movement type: ${movementType}`);
  }

  // ── Step 3: Negative stock guard ──────────────────────────────────────────

  if (newQty.lt(0)) {
    throw new BadRequestError(
      `Insufficient stock. Available: ${prevQty.toFixed(4)}, ` +
        `Requested: ${qtyDecimal.toFixed(4)}.`,
    );
  }

  // ── Step 4: Update inventory summary ──────────────────────────────────────

  const inventoryUpdate: Prisma.InventoryUpdateInput = {
    availableQuantity: newQty,
    damagedQuantity: newDamagedQty,
    averageCost: newAverageCost,
  };

  // Track last purchase price on inbound
  if (
    (movementType === MovementType.PURCHASE || movementType === MovementType.OPENING_STOCK) &&
    unitCost !== undefined &&
    unitCost > 0
  ) {
    inventoryUpdate.lastPurchasePrice = new Prisma.Decimal(unitCost);
  }

  await tx.inventory.update({
    where: { id: inventory.id },
    data: inventoryUpdate,
  });

  // ── Step 5: Create StockMovement audit record ─────────────────────────────

  const movement = await tx.stockMovement.create({
    data: {
      companyId,
      ...(branchId ? { branchId } : {}),
      warehouseId,
      productId,
      movementType,
      quantity: qtyDecimal,
      previousQuantity: prevQty,
      newQuantity: newQty,
      ...(unitCost !== undefined ? { unitCost: new Prisma.Decimal(unitCost) } : {}),
      ...(referenceType ? { referenceType } : {}),
      ...(referenceId ? { referenceId } : {}),
      ...(remarks ? { remarks } : {}),
      performedBy,
    },
    select: { id: true },
  });

  return {
    movementId: movement.id,
    previousQuantity: prevQty,
    newQuantity: newQty,
    updatedInventoryId: inventory.id,
  };
}

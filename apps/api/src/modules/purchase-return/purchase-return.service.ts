import { MovementType, PurchaseReturnStatus, GoodsReceiveStatus, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors/AppError';
import { applyStockOperation } from '../stock-movement/stock-movement.engine';
import { CreatePurchaseReturnBody, PurchaseReturnQuery } from './purchase-return.schema';
import {
  findPurchaseReturns,
  findPurchaseReturnById,
  insertPurchaseReturn,
  updatePurchaseReturnStatus,
  generateNextPurchaseReturnNumber,
  mapPurchaseReturn,
} from './purchase-return.repository';
import { MappedPurchaseReturn } from './purchase-return.types';
import { buildPaginationMeta } from '../../common/utils/query';

export async function createPurchaseReturn(
  body: CreatePurchaseReturnBody,
  actorId: string,
): Promise<MappedPurchaseReturn> {
  // 1. Verify Goods Receive exists and is COMPLETED
  const gr = await prisma.goodsReceive.findUnique({
    where: { id: body.goodsReceiveId },
    include: { items: true },
  });
  if (!gr) {
    throw new NotFoundError(`Goods Receive Note "${body.goodsReceiveId}" not found`);
  }
  if (gr.status !== GoodsReceiveStatus.COMPLETED) {
    throw new BadRequestError(
      `Cannot return items from a Goods Receive Note in status ${gr.status}. It must be COMPLETED.`,
    );
  }

  // 2. Verify Supplier and Warehouse match GRN
  if (gr.supplierId !== body.supplierId) {
    throw new BadRequestError('Supplier ID does not match Goods Receive Note supplier');
  }
  if (gr.warehouseId !== body.warehouseId) {
    throw new BadRequestError('Warehouse ID does not match Goods Receive Note warehouse');
  }

  // 3. Verify Supplier exists
  const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
  if (!supplier) {
    throw new NotFoundError(`Supplier "${body.supplierId}" not found`);
  }

  // 4. Verify Warehouse exists
  const warehouse = await prisma.warehouse.findUnique({ where: { id: body.warehouseId } });
  if (!warehouse) {
    throw new NotFoundError(`Warehouse "${body.warehouseId}" not found`);
  }

  // 5. Fetch existing returns for this GRN to calculate limits (exclude CANCELLED returns)
  const existingReturns = await prisma.purchaseReturn.findMany({
    where: {
      goodsReceiveId: body.goodsReceiveId,
      status: { not: PurchaseReturnStatus.CANCELLED },
    },
    include: { items: true },
  });

  // 6. Validate each return item
  for (const item of body.items) {
    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      throw new NotFoundError(`Product "${item.productId}" not found`);
    }

    // Check product is part of GRN
    const grItem = gr.items.find((gi) => gi.productId === item.productId);
    if (!grItem) {
      throw new BadRequestError(
        `Product "${item.productId}" is not part of Goods Receive Note ${gr.grnNumber}`,
      );
    }

    const grQty = Number(grItem.receivedQuantity.toString());

    // Calculate sum of quantities returned in other non-cancelled returns
    let previouslyReturned = 0;
    for (const ret of existingReturns) {
      const retItem = ret.items.find((ri) => ri.productId === item.productId);
      if (retItem) {
        previouslyReturned += Number(retItem.quantity.toString());
      }
    }

    // Return quantity <= purchased quantity check
    if (previouslyReturned + item.quantity > grQty) {
      throw new BadRequestError(
        `Return quantity (${String(item.quantity)}) plus previously returned (${String(previouslyReturned)}) ` +
          `exceeds quantity received in GRN (${String(grQty)}) for product "${item.productId}".`,
      );
    }

    // Check available stock in warehouse
    const inventory = await prisma.inventory.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId: body.warehouseId,
          productId: item.productId,
        },
      },
    });

    const stockAvailable = inventory ? Number(inventory.availableQuantity.toString()) : 0;
    if (stockAvailable < item.quantity) {
      throw new BadRequestError(
        `Insufficient available quantity in warehouse for product "${item.productId}". ` +
          `Available: ${String(stockAvailable)}, Requested for return: ${String(item.quantity)}.`,
      );
    }
  }

  // 7. Insert Purchase Return inside transaction with sequence number
  const result = await prisma.$transaction(async (tx) => {
    const returnNumber = await generateNextPurchaseReturnNumber(body.companyId, tx);
    return await insertPurchaseReturn(
      {
        ...body,
        returnNumber,
        createdBy: actorId,
      },
      tx,
    );
  });

  console.warn(`[AUDIT] Purchase Return Created: ${result.returnNumber}`);
  return result;
}

export async function approvePurchaseReturn(id: string): Promise<MappedPurchaseReturn> {
  const pr = await prisma.purchaseReturn.findUnique({ where: { id } });
  if (!pr) {
    throw new NotFoundError(`Purchase Return "${id}" not found`);
  }
  if (pr.status !== PurchaseReturnStatus.DRAFT) {
    throw new ConflictError(
      `Purchase Return must be in DRAFT status to approve. Current: ${pr.status}`,
    );
  }

  const updated = await updatePurchaseReturnStatus(id, PurchaseReturnStatus.APPROVED);
  console.warn(`[AUDIT] Purchase Return Approved: ${updated.returnNumber}`);
  return updated;
}

export async function completePurchaseReturn(
  id: string,
  actorId: string,
): Promise<MappedPurchaseReturn> {
  const pr = await prisma.purchaseReturn.findUnique({
    where: { id },
    include: {
      items: true,
      goodsReceive: {
        include: { items: true },
      },
    },
  });

  if (!pr) {
    throw new NotFoundError(`Purchase Return "${id}" not found`);
  }
  if (pr.status !== PurchaseReturnStatus.APPROVED) {
    throw new ConflictError(
      `Purchase Return must be in APPROVED status to complete. Current: ${pr.status}`,
    );
  }

  // Run everything inside transaction to ensure atomic execution
  const completedPR = await prisma.$transaction(async (tx) => {
    // 1. Fetch other returns to ensure no double completion violates limits
    const existingReturns = await tx.purchaseReturn.findMany({
      where: {
        goodsReceiveId: pr.goodsReceiveId,
        status: PurchaseReturnStatus.COMPLETED,
        id: { not: pr.id },
      },
      include: { items: true },
    });

    for (const item of pr.items) {
      const grItem = pr.goodsReceive.items.find((gi) => gi.productId === item.productId);
      if (!grItem) {
        throw new BadRequestError(`Product "${item.productId}" is not part of GRN`);
      }

      const grQty = Number(grItem.receivedQuantity.toString());

      let previouslyReturned = 0;
      for (const ret of existingReturns) {
        const retItem = ret.items.find((ri) => ri.productId === item.productId);
        if (retItem) {
          previouslyReturned += Number(retItem.quantity.toString());
        }
      }

      const returnQty = Number(item.quantity.toString());
      if (previouslyReturned + returnQty > grQty) {
        throw new BadRequestError(
          `Completing this return would cause product "${item.productId}" returned quantity to exceed GRN limits.`,
        );
      }

      // Check current available quantity
      const inventory = await tx.inventory.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: pr.warehouseId,
            productId: item.productId,
          },
        },
      });

      if (!inventory) {
        throw new BadRequestError(
          `No inventory record found for product "${item.productId}" in warehouse.`,
        );
      }

      const availableQty = Number(inventory.availableQuantity.toString());
      if (availableQty < returnQty) {
        throw new BadRequestError(
          `Insufficient stock to complete return for product "${item.productId}". ` +
            `Available: ${String(availableQty)}, Required: ${String(returnQty)}.`,
        );
      }

      // 2. Perform Stock Movement (PURCHASE_RETURN)
      await applyStockOperation(tx, {
        companyId: pr.companyId,
        branchId: pr.branchId ?? undefined,
        warehouseId: pr.warehouseId,
        productId: item.productId,
        movementType: MovementType.PURCHASE_RETURN,
        quantity: returnQty,
        unitCost: Number(item.unitCost.toString()),
        referenceType: 'PURCHASE_RETURN',
        referenceId: pr.id,
        remarks: `Returned via ${pr.returnNumber}`,
        performedBy: actorId,
      });

      console.warn(
        `[AUDIT] Stock Decreased for product "${item.productId}" via Return ${pr.returnNumber}`,
      );
    }

    // 3. Update Supplier Balance (Decrement currentBalance by return grandTotal)
    const updatedSupplier = await tx.supplier.update({
      where: { id: pr.supplierId },
      data: {
        currentBalance: {
          decrement: pr.grandTotal,
        },
      },
      select: { currentBalance: true },
    });

    // 4. Create Supplier Ledger Entry (PURCHASE_RETURN)
    await tx.supplierLedgerEntry.create({
      data: {
        companyId: pr.companyId,
        supplierId: pr.supplierId,
        entryType: 'PURCHASE_RETURN',
        amount: new Prisma.Decimal(-Number(pr.grandTotal.toString())),
        runningBalance: updatedSupplier.currentBalance,
        referenceId: pr.id,
        referenceNo: pr.returnNumber,
        description: `Purchase Return ${pr.returnNumber} completed against GRN ${pr.goodsReceive.grnNumber}`,
      },
    });

    // 5. Update Status to COMPLETED
    const updatedPR = await tx.purchaseReturn.update({
      where: { id: pr.id },
      data: { status: PurchaseReturnStatus.COMPLETED },
      include: {
        warehouse: { select: { id: true, name: true, code: true } },
        supplier: { select: { id: true, companyName: true, supplierCode: true } },
        goodsReceive: { select: { id: true, grnNumber: true, status: true } },
        items: { select: ITEM_SELECT_FOR_TX_MAP, orderBy: { product: { name: 'asc' as const } } },
      },
    });

    return mapPurchaseReturn(updatedPR);
  });

  console.warn(`[AUDIT] Purchase Return Completed: ${completedPR.returnNumber}`);
  return completedPR;
}

const ITEM_SELECT_FOR_TX_MAP = {
  id: true,
  purchaseReturnId: true,
  productId: true,
  quantity: true,
  unitCost: true,
  total: true,
  product: { select: { id: true, name: true, sku: true } },
};

export async function cancelPurchaseReturn(id: string): Promise<MappedPurchaseReturn> {
  const pr = await prisma.purchaseReturn.findUnique({ where: { id } });
  if (!pr) {
    throw new NotFoundError(`Purchase Return "${id}" not found`);
  }
  if (pr.status !== PurchaseReturnStatus.DRAFT && pr.status !== PurchaseReturnStatus.APPROVED) {
    throw new ConflictError(
      `Only DRAFT or APPROVED Purchase Returns can be cancelled. Current: ${pr.status}`,
    );
  }

  const updated = await updatePurchaseReturnStatus(id, PurchaseReturnStatus.CANCELLED);
  console.warn(`[AUDIT] Purchase Return Cancelled: ${updated.returnNumber}`);
  return updated;
}

export async function listPurchaseReturns(query: PurchaseReturnQuery): Promise<{
  returns: MappedPurchaseReturn[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  return await findPurchaseReturns(query);
}

export async function getPurchaseReturnById(id: string): Promise<MappedPurchaseReturn> {
  const pr = await findPurchaseReturnById(id);
  if (!pr) {
    throw new NotFoundError(`Purchase Return "${id}" not found`);
  }
  return pr;
}

import { GoodsReceiveStatus, PurchaseOrderStatus, MovementType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import { CreateGoodsReceiveBody, GoodsReceiveQuery } from './goods-receive.schema';
import {
  findGoodsReceives,
  findGoodsReceiveById,
  generateNextGRNNumber,
  insertGoodsReceive,
  updateGoodsReceiveStatus,
} from './goods-receive.repository';
import { mapGoodsReceive, mapGoodsReceiveList, MappedGoodsReceive } from './goods-receive.mapper';
import { applyStockOperation } from '../stock-movement/stock-movement.engine';

async function validateWarehouseAndSupplier(
  warehouseId: string,
  supplierId: string,
): Promise<void> {
  const [wh, supplier] = await Promise.all([
    prisma.warehouse.findUnique({ where: { id: warehouseId }, select: { id: true } }),
    prisma.supplier.findUnique({ where: { id: supplierId }, select: { id: true } }),
  ]);
  if (!wh) {
    throw new NotFoundError(`Warehouse "${warehouseId}" not found`);
  }
  if (!supplier) {
    throw new NotFoundError(`Supplier "${supplierId}" not found`);
  }
}

export async function createGRN(
  body: CreateGoodsReceiveBody,
  actorId: string,
): Promise<MappedGoodsReceive> {
  await validateWarehouseAndSupplier(body.warehouseId, body.supplierId);

  // If PO is linked, check status
  if (body.purchaseOrderId) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: body.purchaseOrderId },
      include: {
        items: true,
        goodsReceives: {
          where: { status: GoodsReceiveStatus.COMPLETED },
          include: { items: true },
        },
      },
    });

    if (!po) {
      throw new NotFoundError(`Purchase Order "${body.purchaseOrderId}" not found`);
    }
    if (
      po.status !== PurchaseOrderStatus.APPROVED &&
      po.status !== PurchaseOrderStatus.PARTIALLY_RECEIVED
    ) {
      throw new BadRequestError(
        `Cannot receive items from a Purchase Order with status ${po.status}`,
      );
    }

    // Validate receiving quantities
    for (const item of body.items) {
      const poItem = po.items.find((pi) => pi.productId === item.productId);
      if (!poItem) {
        throw new BadRequestError(
          `Product "${item.productId}" is not part of Purchase Order ${po.purchaseOrderNumber}`,
        );
      }

      // Sum previously received quantities
      let previouslyReceived = 0;
      for (const gr of po.goodsReceives) {
        const grItem = gr.items.find((gi) => gi.productId === item.productId);
        if (grItem) {
          previouslyReceived += Number(grItem.receivedQuantity.toString());
        }
      }

      const orderedQty = Number(poItem.quantity.toString());
      if (previouslyReceived + item.receivedQuantity > orderedQty) {
        throw new BadRequestError(
          `Product "${item.productId}" received quantity (${String(item.receivedQuantity)}) ` +
            `plus previously received (${String(previouslyReceived)}) exceeds ordered quantity (${String(orderedQty)})`,
        );
      }
    }
  }

  const gr = await prisma.$transaction(async (tx) => {
    const grnNumber = await generateNextGRNNumber(body.companyId, tx);
    return await insertGoodsReceive(
      {
        ...body,
        grnNumber,
        receivedBy: actorId,
      },
      tx,
    );
  });

  console.warn(`[AUDIT] GRN Created: ${gr.grnNumber}`);
  return mapGoodsReceive(gr);
}

export async function listGRNs(query: GoodsReceiveQuery): Promise<{
  receives: MappedGoodsReceive[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { receives, meta } = await findGoodsReceives(query);
  return { receives: mapGoodsReceiveList(receives), meta };
}

export async function getGRNById(id: string): Promise<MappedGoodsReceive> {
  const gr = await findGoodsReceiveById(id);
  if (!gr) {
    throw new NotFoundError(`Goods Receive Note "${id}" not found`);
  }
  return mapGoodsReceive(gr);
}

export async function completeGRN(id: string, actorId: string): Promise<MappedGoodsReceive> {
  const grn = await findGoodsReceiveById(id);
  if (!grn) {
    throw new NotFoundError(`Goods Receive Note "${id}" not found`);
  }
  if (grn.status !== GoodsReceiveStatus.DRAFT) {
    throw new ConflictError(
      `Goods Receive Note must be in DRAFT status to complete. Current: ${grn.status}`,
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Double check PO limits inside transaction
    if (grn.purchaseOrderId) {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: grn.purchaseOrderId },
        include: {
          items: true,
          goodsReceives: {
            where: { status: GoodsReceiveStatus.COMPLETED },
            include: { items: true },
          },
        },
      });

      if (!po) {
        throw new NotFoundError(`Purchase Order "${grn.purchaseOrderId}" not found`);
      }

      for (const item of grn.items) {
        const poItem = po.items.find((pi) => pi.productId === item.productId);
        if (!poItem) {
          throw new BadRequestError(`Product "${item.productId}" not in PO`);
        }

        let previouslyReceived = 0;
        for (const gr of po.goodsReceives) {
          const grItem = gr.items.find((gi) => gi.productId === item.productId);
          if (grItem) {
            previouslyReceived += Number(grItem.receivedQuantity.toString());
          }
        }

        const orderedQty = Number(poItem.quantity.toString());
        const currentRecQty = Number(item.receivedQuantity.toString());
        if (previouslyReceived + currentRecQty > orderedQty) {
          throw new BadRequestError(
            `Completing this GRN would cause product "${item.productId}" total received quantity to exceed PO limits.`,
          );
        }
      }
    }

    // 2. Loop items and update stock (PURCHASE)
    for (const item of grn.items) {
      const qty = Number(item.receivedQuantity.toString());
      if (qty > 0) {
        await applyStockOperation(tx, {
          companyId: grn.companyId,
          branchId: grn.branchId ?? undefined,
          warehouseId: grn.warehouseId,
          productId: item.productId,
          movementType: MovementType.PURCHASE,
          quantity: qty,
          unitCost: Number(item.unitCost.toString()),
          referenceType: 'GOODS_RECEIVE',
          referenceId: grn.id,
          remarks: `Received via ${grn.grnNumber}`,
          performedBy: actorId,
        });
        console.warn(
          `[AUDIT] Stock Updated for product "${item.productId}" via GRN ${grn.grnNumber}`,
        );
      }
    }

    // 3. Update PO status if linked
    if (grn.purchaseOrderId) {
      // Refresh PO items and completed GRNs (including this transaction's GRN items)
      const po = await tx.purchaseOrder.findUnique({
        where: { id: grn.purchaseOrderId },
        include: {
          items: true,
          goodsReceives: {
            // Either COMPLETED or this current GRN that we are completing in this transaction
            where: {
              OR: [{ status: GoodsReceiveStatus.COMPLETED }, { id: grn.id }],
            },
            include: { items: true },
          },
        },
      });

      if (po) {
        let allReceived = true;
        let anyReceived = false;

        for (const poItem of po.items) {
          let totalRec = 0;
          for (const gr of po.goodsReceives) {
            // Note: Since this tx is completing grn, the query may not have status=COMPLETED yet,
            // but we fetch it explicitly using OR filters.
            const grItem = gr.items.find((gi) => gi.productId === poItem.productId);
            if (grItem) {
              totalRec += Number(grItem.receivedQuantity.toString());
            }
          }

          const ordered = Number(poItem.quantity.toString());
          if (totalRec < ordered) {
            allReceived = false;
          }
          if (totalRec > 0) {
            anyReceived = true;
          }
        }

        const newStatus = allReceived
          ? PurchaseOrderStatus.RECEIVED
          : anyReceived
            ? PurchaseOrderStatus.PARTIALLY_RECEIVED
            : PurchaseOrderStatus.APPROVED;

        await tx.purchaseOrder.update({
          where: { id: po.id },
          data: { status: newStatus },
        });
        console.warn(
          `[AUDIT] Purchase Order ${po.purchaseOrderNumber} status updated to ${newStatus}`,
        );
      }
    }

    // 4. Set status to COMPLETED
    return await updateGoodsReceiveStatus(id, GoodsReceiveStatus.COMPLETED, tx);
  });

  console.warn(`[AUDIT] GRN Completed: ${grn.grnNumber}`);
  return mapGoodsReceive(result);
}

export async function cancelGRN(id: string): Promise<MappedGoodsReceive> {
  const grn = await findGoodsReceiveById(id);
  if (!grn) {
    throw new NotFoundError(`Goods Receive Note "${id}" not found`);
  }
  if (grn.status !== GoodsReceiveStatus.DRAFT) {
    throw new ConflictError(
      `Only DRAFT Goods Receive Notes can be cancelled. Current: ${grn.status}`,
    );
  }

  const updated = await updateGoodsReceiveStatus(id, GoodsReceiveStatus.CANCELLED);
  console.warn(`[AUDIT] GRN Cancelled: ${grn.grnNumber}`);
  return mapGoodsReceive(updated);
}

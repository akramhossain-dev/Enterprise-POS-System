import { PurchaseOrderStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import {
  CreatePurchaseOrderBody,
  UpdatePurchaseOrderBody,
  PurchaseOrderQuery,
} from './purchase-order.schema';
import {
  findPurchaseOrders,
  findPurchaseOrderById,
  generateNextPONumber,
  insertPurchaseOrder,
  updatePurchaseOrderRecord,
  updatePurchaseOrderStatus,
  deletePurchaseOrderRecord,
} from './purchase-order.repository';
import {
  mapPurchaseOrder,
  mapPurchaseOrderList,
  MappedPurchaseOrder,
} from './purchase-order.mapper';

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

async function validateProducts(items: { productId: string }[]): Promise<void> {
  const productIds = items.map((i) => i.productId);
  const existingProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true },
  });
  if (existingProducts.length !== productIds.length) {
    throw new NotFoundError('One or more products in items do not exist');
  }
}

export async function createPO(
  body: CreatePurchaseOrderBody,
  actorId: string,
): Promise<MappedPurchaseOrder> {
  await validateWarehouseAndSupplier(body.warehouseId, body.supplierId);
  await validateProducts(body.items);

  const po = await prisma.$transaction(async (tx) => {
    const purchaseOrderNumber = await generateNextPONumber(body.companyId, tx);
    return await insertPurchaseOrder({
      ...body,
      purchaseOrderNumber,
      createdBy: actorId,
    });
  });

  return mapPurchaseOrder(po);
}

export async function listPOs(query: PurchaseOrderQuery): Promise<{
  orders: MappedPurchaseOrder[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { orders, meta } = await findPurchaseOrders(query);
  return { orders: mapPurchaseOrderList(orders), meta };
}

export async function getPOById(id: string): Promise<MappedPurchaseOrder> {
  const po = await findPurchaseOrderById(id);
  if (!po) {
    throw new NotFoundError(`Purchase order "${id}" not found`);
  }
  return mapPurchaseOrder(po);
}

export async function updatePO(
  id: string,
  body: UpdatePurchaseOrderBody,
): Promise<MappedPurchaseOrder> {
  const po = await findPurchaseOrderById(id);
  if (!po) {
    throw new NotFoundError(`Purchase order "${id}" not found`);
  }

  if (po.status !== PurchaseOrderStatus.DRAFT && po.status !== PurchaseOrderStatus.PENDING) {
    throw new BadRequestError(`Cannot update a purchase order in status ${po.status}`);
  }

  const warehouseId = body.warehouseId ?? po.warehouseId;
  const supplierId = body.supplierId ?? po.supplierId;
  await validateWarehouseAndSupplier(warehouseId, supplierId);

  if (body.items) {
    await validateProducts(body.items);
  }

  const updated = await updatePurchaseOrderRecord(id, body);
  return mapPurchaseOrder(updated);
}

export async function submitPO(id: string): Promise<MappedPurchaseOrder> {
  const po = await findPurchaseOrderById(id);
  if (!po) {
    throw new NotFoundError(`Purchase order "${id}" not found`);
  }
  if (po.status !== PurchaseOrderStatus.DRAFT) {
    throw new ConflictError(`Purchase order must be DRAFT to submit. Current status: ${po.status}`);
  }
  const updated = await updatePurchaseOrderStatus(id, PurchaseOrderStatus.PENDING);
  return mapPurchaseOrder(updated);
}

export async function approvePO(id: string, actorId: string): Promise<MappedPurchaseOrder> {
  const po = await findPurchaseOrderById(id);
  if (!po) {
    throw new NotFoundError(`Purchase order "${id}" not found`);
  }
  if (po.status !== PurchaseOrderStatus.PENDING && po.status !== PurchaseOrderStatus.DRAFT) {
    throw new ConflictError(
      `Purchase order must be PENDING or DRAFT to approve. Current status: ${po.status}`,
    );
  }
  const updated = await updatePurchaseOrderStatus(id, PurchaseOrderStatus.APPROVED, actorId);
  return mapPurchaseOrder(updated);
}

export async function rejectPO(id: string, actorId: string): Promise<MappedPurchaseOrder> {
  const po = await findPurchaseOrderById(id);
  if (!po) {
    throw new NotFoundError(`Purchase order "${id}" not found`);
  }
  if (po.status !== PurchaseOrderStatus.PENDING) {
    throw new ConflictError(
      `Purchase order must be PENDING to reject. Current status: ${po.status}`,
    );
  }
  const updated = await updatePurchaseOrderStatus(id, PurchaseOrderStatus.REJECTED, actorId);
  return mapPurchaseOrder(updated);
}

export async function cancelPO(id: string): Promise<MappedPurchaseOrder> {
  const po = await findPurchaseOrderById(id);
  if (!po) {
    throw new NotFoundError(`Purchase order "${id}" not found`);
  }
  if (
    po.status === PurchaseOrderStatus.RECEIVED ||
    po.status === PurchaseOrderStatus.PARTIALLY_RECEIVED ||
    po.status === PurchaseOrderStatus.CANCELLED
  ) {
    throw new ConflictError(`Cannot cancel a purchase order with status ${po.status}`);
  }
  const updated = await updatePurchaseOrderStatus(id, PurchaseOrderStatus.CANCELLED);
  return mapPurchaseOrder(updated);
}

export async function deletePO(id: string): Promise<void> {
  const po = await findPurchaseOrderById(id);
  if (!po) {
    throw new NotFoundError(`Purchase order "${id}" not found`);
  }
  if (po.status !== PurchaseOrderStatus.DRAFT && po.status !== PurchaseOrderStatus.PENDING) {
    throw new BadRequestError(`Cannot delete a purchase order with status ${po.status}`);
  }
  await deletePurchaseOrderRecord(id);
}

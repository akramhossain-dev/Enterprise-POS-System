import { Prisma, PurchaseOrderStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import {
  PurchaseOrderQuery,
  CreatePurchaseOrderBody,
  UpdatePurchaseOrderBody,
} from './purchase-order.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaPurchaseOrderWithRelations } from './purchase-order.mapper';

const ITEM_SELECT = {
  id: true,
  purchaseOrderId: true,
  productId: true,
  quantity: true,
  unitPrice: true,
  discount: true,
  tax: true,
  total: true,
  product: { select: { id: true, name: true, sku: true } },
} satisfies Prisma.PurchaseOrderItemSelect;

const SELECT = {
  id: true,
  companyId: true,
  branchId: true,
  warehouseId: true,
  supplierId: true,
  purchaseOrderNumber: true,
  orderDate: true,
  expectedDate: true,
  status: true,
  subtotal: true,
  discount: true,
  tax: true,
  shippingCost: true,
  grandTotal: true,
  remarks: true,
  createdBy: true,
  approvedBy: true,
  createdAt: true,
  updatedAt: true,
  warehouse: { select: { id: true, name: true, code: true } },
  supplier: { select: { id: true, companyName: true, supplierCode: true } },
  items: { select: ITEM_SELECT, orderBy: { product: { name: 'asc' as const } } },
} satisfies Prisma.PurchaseOrderSelect;

export async function findPurchaseOrders(query: PurchaseOrderQuery): Promise<{
  orders: PrismaPurchaseOrderWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  const searchFilter: Prisma.PurchaseOrderWhereInput = query.search
    ? {
        OR: [
          { purchaseOrderNumber: { contains: query.search, mode: 'insensitive' as const } },
          { supplier: { companyName: { contains: query.search, mode: 'insensitive' as const } } },
          { warehouse: { name: { contains: query.search, mode: 'insensitive' as const } } },
        ],
      }
    : {};

  const where: Prisma.PurchaseOrderWhereInput = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
    ...(query.supplierId ? { supplierId: query.supplierId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.purchaseOrderNumber
      ? {
          purchaseOrderNumber: {
            contains: query.purchaseOrderNumber,
            mode: 'insensitive' as const,
          },
        }
      : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          orderDate: {
            ...(query.dateFrom ? { gte: query.dateFrom } : {}),
            ...(query.dateTo ? { lte: query.dateTo } : {}),
          },
        }
      : {}),
    ...searchFilter,
  };

  const [orders, total] = await prisma.$transaction([
    prisma.purchaseOrder.findMany({
      where,
      select: SELECT,
      orderBy: { orderDate: query.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return {
    orders: orders as unknown as PrismaPurchaseOrderWithRelations[],
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function findPurchaseOrderById(
  id: string,
): Promise<PrismaPurchaseOrderWithRelations | null> {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    select: SELECT,
  });
  return po;
}

export async function generateNextPONumber(
  companyId: string,
  tx: Prisma.TransactionClient,
): Promise<string> {
  const count = await tx.purchaseOrder.count({
    where: { companyId },
  });
  return `PO-${String(count + 1).padStart(6, '0')}`;
}

export async function insertPurchaseOrder(
  data: CreatePurchaseOrderBody & { purchaseOrderNumber: string; createdBy: string },
): Promise<PrismaPurchaseOrderWithRelations> {
  return await prisma.$transaction(async (tx) => {
    // 1. Calculate item totals and subtotal
    let subtotal = 0;
    const itemsData = data.items.map((item) => {
      const qty = item.quantity;
      const price = item.unitPrice;
      const itemDiscount = item.discount ?? 0;
      const itemTax = item.tax ?? 0;
      const total = qty * price - itemDiscount + itemTax;
      subtotal += total;

      return {
        productId: item.productId,
        quantity: qty,
        unitPrice: price,
        discount: itemDiscount,
        tax: itemTax,
        total,
      };
    });

    const discount = data.discount ?? 0;
    const tax = data.tax ?? 0;
    const shipping = data.shippingCost ?? 0;
    const grandTotal = subtotal - discount + tax + shipping;

    const po = await tx.purchaseOrder.create({
      data: {
        companyId: data.companyId,
        branchId: data.branchId ?? null,
        warehouseId: data.warehouseId,
        supplierId: data.supplierId,
        purchaseOrderNumber: data.purchaseOrderNumber,
        orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        status: PurchaseOrderStatus.DRAFT,
        subtotal,
        discount,
        tax,
        shippingCost: shipping,
        grandTotal,
        remarks: data.remarks ?? null,
        createdBy: data.createdBy,
        items: {
          createMany: {
            data: itemsData,
          },
        },
      },
      select: SELECT,
    });

    return po;
  });
}

export async function updatePurchaseOrderRecord(
  id: string,
  data: UpdatePurchaseOrderBody,
): Promise<PrismaPurchaseOrderWithRelations> {
  return await prisma.$transaction(async (tx) => {
    // Fetch current PO to retain totals if items aren't updated
    const currentPO = await tx.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!currentPO) {
      throw new Error(`Purchase order "${id}" not found`);
    }

    let subtotal = currentPO.subtotal.toNumber();

    if (data.items) {
      // Delete old items
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: id },
      });

      // Calculate new items and subtotal
      subtotal = 0;
      const newItems = data.items.map((item) => {
        const qty = item.quantity;
        const price = item.unitPrice;
        const itemDiscount = item.discount ?? 0;
        const itemTax = item.tax ?? 0;
        const total = qty * price - itemDiscount + itemTax;
        subtotal += total;

        return {
          purchaseOrderId: id,
          productId: item.productId,
          quantity: new Prisma.Decimal(qty),
          unitPrice: new Prisma.Decimal(price),
          discount: new Prisma.Decimal(itemDiscount),
          tax: new Prisma.Decimal(itemTax),
          total: new Prisma.Decimal(total),
        };
      });

      // Create new items
      await tx.purchaseOrderItem.createMany({
        data: newItems.map((item) => ({
          productId: item.productId,
          purchaseOrderId: item.purchaseOrderId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: item.tax,
          total: item.total,
        })),
      });
    }

    const discount = data.discount ?? currentPO.discount.toNumber();
    const tax = data.tax ?? currentPO.tax.toNumber();
    const shipping = data.shippingCost ?? currentPO.shippingCost.toNumber();
    const grandTotal = subtotal - discount + tax + shipping;

    const updateData: Prisma.PurchaseOrderUncheckedUpdateInput = {
      subtotal,
      discount,
      tax,
      shippingCost: shipping,
      grandTotal,
      ...(data.branchId !== undefined ? { branchId: data.branchId ?? null } : {}),
      ...(data.warehouseId !== undefined ? { warehouseId: data.warehouseId } : {}),
      ...(data.supplierId !== undefined ? { supplierId: data.supplierId } : {}),
      ...(data.orderDate ? { orderDate: new Date(data.orderDate) } : {}),
      ...(data.expectedDate !== undefined
        ? { expectedDate: data.expectedDate ? new Date(data.expectedDate) : null }
        : {}),
      ...(data.remarks !== undefined ? { remarks: data.remarks ?? null } : {}),
    };

    const updated = await tx.purchaseOrder.update({
      where: { id },
      data: updateData,
      select: SELECT,
    });

    return updated;
  });
}

export async function updatePurchaseOrderStatus(
  id: string,
  status: PurchaseOrderStatus,
  approvedBy?: string,
): Promise<PrismaPurchaseOrderWithRelations> {
  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status,
      ...(approvedBy ? { approvedBy } : {}),
    },
    select: SELECT,
  });
  return updated;
}

export async function deletePurchaseOrderRecord(id: string): Promise<void> {
  await prisma.purchaseOrder.delete({
    where: { id },
  });
}

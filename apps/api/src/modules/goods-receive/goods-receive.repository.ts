import { Prisma, GoodsReceiveStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { GoodsReceiveQuery, CreateGoodsReceiveBody } from './goods-receive.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaGoodsReceiveWithRelations } from './goods-receive.types';

const ITEM_SELECT = {
  id: true,
  goodsReceiveId: true,
  productId: true,
  quantity: true,
  receivedQuantity: true,
  unitCost: true,
  batchNumber: true,
  expiryDate: true,
  serialRequired: true,
  total: true,
  createdAt: true,
  product: { select: { id: true, name: true, sku: true } },
} satisfies Prisma.GoodsReceiveItemSelect;

const SELECT = {
  id: true,
  companyId: true,
  branchId: true,
  warehouseId: true,
  supplierId: true,
  purchaseOrderId: true,
  grnNumber: true,
  receiveDate: true,
  status: true,
  subtotal: true,
  discount: true,
  tax: true,
  grandTotal: true,
  remarks: true,
  receivedBy: true,
  createdAt: true,
  updatedAt: true,
  warehouse: { select: { id: true, name: true, code: true } },
  supplier: { select: { id: true, companyName: true, supplierCode: true } },
  purchaseOrder: { select: { id: true, purchaseOrderNumber: true, status: true } },
  items: { select: ITEM_SELECT, orderBy: { product: { name: 'asc' as const } } },
} satisfies Prisma.GoodsReceiveSelect;

export async function findGoodsReceives(query: GoodsReceiveQuery): Promise<{
  receives: PrismaGoodsReceiveWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  const searchFilter: Prisma.GoodsReceiveWhereInput = query.search
    ? {
        OR: [
          { grnNumber: { contains: query.search, mode: 'insensitive' as const } },
          { supplier: { companyName: { contains: query.search, mode: 'insensitive' as const } } },
          {
            purchaseOrder: {
              purchaseOrderNumber: { contains: query.search, mode: 'insensitive' as const },
            },
          },
        ],
      }
    : {};

  const where: Prisma.GoodsReceiveWhereInput = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
    ...(query.supplierId ? { supplierId: query.supplierId } : {}),
    ...(query.purchaseOrderId ? { purchaseOrderId: query.purchaseOrderId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.grnNumber
      ? { grnNumber: { contains: query.grnNumber, mode: 'insensitive' as const } }
      : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          receiveDate: {
            ...(query.dateFrom ? { gte: query.dateFrom } : {}),
            ...(query.dateTo ? { lte: query.dateTo } : {}),
          },
        }
      : {}),
    ...searchFilter,
  };

  const [receives, total] = await prisma.$transaction([
    prisma.goodsReceive.findMany({
      where,
      select: SELECT,
      orderBy: { receiveDate: query.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.goodsReceive.count({ where }),
  ]);

  return {
    receives: receives as unknown as PrismaGoodsReceiveWithRelations[],
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function findGoodsReceiveById(
  id: string,
): Promise<PrismaGoodsReceiveWithRelations | null> {
  const gr = await prisma.goodsReceive.findUnique({
    where: { id },
    select: SELECT,
  });
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return gr as unknown as PrismaGoodsReceiveWithRelations | null;
}

export async function generateNextGRNNumber(
  companyId: string,
  tx: Prisma.TransactionClient,
): Promise<string> {
  const count = await tx.goodsReceive.count({
    where: { companyId },
  });
  return `GRN-${String(count + 1).padStart(6, '0')}`;
}

export async function insertGoodsReceive(
  data: CreateGoodsReceiveBody & { grnNumber: string; receivedBy: string },
  tx: Prisma.TransactionClient,
): Promise<PrismaGoodsReceiveWithRelations> {
  // 1. Calculate item totals and subtotal
  let subtotal = 0;
  const itemsData = data.items.map((item) => {
    const qty = item.receivedQuantity;
    const cost = item.unitCost;
    const total = qty * cost;
    subtotal += total;

    return {
      productId: item.productId,
      quantity: item.quantity,
      receivedQuantity: qty,
      unitCost: cost,
      batchNumber: item.batchNumber ?? null,
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      serialRequired: item.serialRequired,
      total,
    };
  });

  const discount = data.discount ?? 0;
  const tax = data.tax ?? 0;
  const grandTotal = subtotal - discount + tax;

  const gr = await tx.goodsReceive.create({
    data: {
      companyId: data.companyId,
      branchId: data.branchId ?? null,
      warehouseId: data.warehouseId,
      supplierId: data.supplierId,
      purchaseOrderId: data.purchaseOrderId ?? null,
      grnNumber: data.grnNumber,
      receiveDate: data.receiveDate ? new Date(data.receiveDate) : new Date(),
      status: GoodsReceiveStatus.DRAFT,
      subtotal,
      discount,
      tax,
      grandTotal,
      remarks: data.remarks ?? null,
      receivedBy: data.receivedBy,
      items: {
        createMany: {
          data: itemsData,
        },
      },
    },
    select: SELECT,
  });

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return gr as unknown as PrismaGoodsReceiveWithRelations;
}

export async function updateGoodsReceiveStatus(
  id: string,
  status: GoodsReceiveStatus,
  tx?: Prisma.TransactionClient,
): Promise<PrismaGoodsReceiveWithRelations> {
  const client = tx ?? prisma;
  const gr = await client.goodsReceive.update({
    where: { id },
    data: { status },
    select: SELECT,
  });
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return gr as unknown as PrismaGoodsReceiveWithRelations;
}

import { Prisma, PurchaseReturnStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { PurchaseReturnQuery, CreatePurchaseReturnBody } from './purchase-return.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { MappedPurchaseReturn, MappedPurchaseReturnItem } from './purchase-return.types';

const ITEM_SELECT = {
  id: true,
  purchaseReturnId: true,
  productId: true,
  quantity: true,
  unitCost: true,
  total: true,
  product: { select: { id: true, name: true, sku: true } },
} satisfies Prisma.PurchaseReturnItemSelect;

const SELECT = {
  id: true,
  companyId: true,
  branchId: true,
  warehouseId: true,
  supplierId: true,
  goodsReceiveId: true,
  returnNumber: true,
  returnDate: true,
  status: true,
  subtotal: true,
  discount: true,
  tax: true,
  grandTotal: true,
  reason: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  warehouse: { select: { id: true, name: true, code: true } },
  supplier: { select: { id: true, companyName: true, supplierCode: true } },
  goodsReceive: { select: { id: true, grnNumber: true, status: true } },
  items: { select: ITEM_SELECT, orderBy: { product: { name: 'asc' as const } } },
} satisfies Prisma.PurchaseReturnSelect;

type DbReturnItem = Prisma.PurchaseReturnItemGetPayload<{
  select: typeof ITEM_SELECT;
}>;

export function mapPurchaseReturnItem(i: DbReturnItem): MappedPurchaseReturnItem {
  return {
    id: i.id,
    productId: i.productId,
    productName: i.product.name,
    productSku: i.product.sku,
    quantity: i.quantity.toString(),
    unitCost: i.unitCost.toString(),
    total: i.total.toString(),
  };
}

type DbPurchaseReturn = Prisma.PurchaseReturnGetPayload<{
  select: typeof SELECT;
}>;

export function mapPurchaseReturn(pr: DbPurchaseReturn): MappedPurchaseReturn {
  return {
    id: pr.id,
    companyId: pr.companyId,
    branchId: pr.branchId,
    warehouseId: pr.warehouseId,
    warehouseName: pr.warehouse.name,
    warehouseCode: pr.warehouse.code,
    supplierId: pr.supplierId,
    supplierName: pr.supplier.companyName,
    supplierCode: pr.supplier.supplierCode,
    goodsReceiveId: pr.goodsReceiveId,
    grnNumber: pr.goodsReceive.grnNumber,
    returnNumber: pr.returnNumber,
    returnDate: pr.returnDate.toISOString(),
    status: pr.status,
    subtotal: pr.subtotal.toString(),
    tax: pr.tax.toString(),
    discount: pr.discount.toString(),
    grandTotal: pr.grandTotal.toString(),
    reason: pr.reason,
    createdBy: pr.createdBy,
    createdAt: pr.createdAt.toISOString(),
    updatedAt: pr.updatedAt.toISOString(),
    items: pr.items.map(mapPurchaseReturnItem),
  };
}

export async function findPurchaseReturns(query: PurchaseReturnQuery): Promise<{
  returns: MappedPurchaseReturn[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  const searchFilter: Prisma.PurchaseReturnWhereInput = query.search
    ? {
        OR: [
          { returnNumber: { contains: query.search, mode: 'insensitive' as const } },
          { supplier: { companyName: { contains: query.search, mode: 'insensitive' as const } } },
          { goodsReceive: { grnNumber: { contains: query.search, mode: 'insensitive' as const } } },
        ],
      }
    : {};

  const where: Prisma.PurchaseReturnWhereInput = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
    ...(query.supplierId ? { supplierId: query.supplierId } : {}),
    ...(query.goodsReceiveId ? { goodsReceiveId: query.goodsReceiveId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.returnNumber
      ? { returnNumber: { contains: query.returnNumber, mode: 'insensitive' as const } }
      : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          returnDate: {
            ...(query.dateFrom ? { gte: query.dateFrom } : {}),
            ...(query.dateTo ? { lte: query.dateTo } : {}),
          },
        }
      : {}),
    ...searchFilter,
  };

  const [returns, total] = await prisma.$transaction([
    prisma.purchaseReturn.findMany({
      where,
      select: SELECT,
      orderBy: { returnDate: query.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.purchaseReturn.count({ where }),
  ]);

  return {
    returns: returns.map(mapPurchaseReturn),
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function findPurchaseReturnById(id: string): Promise<MappedPurchaseReturn | null> {
  const pr = await prisma.purchaseReturn.findUnique({
    where: { id },
    select: SELECT,
  });
  if (!pr) {
    return null;
  }
  return mapPurchaseReturn(pr);
}

export async function generateNextPurchaseReturnNumber(
  companyId: string,
  tx: Prisma.TransactionClient,
): Promise<string> {
  const count = await tx.purchaseReturn.count({
    where: { companyId },
  });
  return `PR-${String(count + 1).padStart(6, '0')}`;
}

export async function insertPurchaseReturn(
  data: CreatePurchaseReturnBody & { returnNumber: string; createdBy: string },
  tx: Prisma.TransactionClient,
): Promise<MappedPurchaseReturn> {
  // 1. Calculate items total and subtotal
  let subtotal = 0;
  const itemsData = data.items.map((item) => {
    const total = item.quantity * item.unitCost;
    subtotal += total;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      total,
    };
  });

  const tax = data.tax ?? 0;
  const discount = data.discount ?? 0;
  const grandTotal = subtotal + tax - discount;

  // 2. Create purchase return header and items
  const created = await tx.purchaseReturn.create({
    data: {
      companyId: data.companyId,
      branchId: data.branchId ?? null,
      warehouseId: data.warehouseId,
      supplierId: data.supplierId,
      goodsReceiveId: data.goodsReceiveId,
      returnNumber: data.returnNumber,
      returnDate: data.returnDate ? new Date(data.returnDate) : new Date(),
      status: PurchaseReturnStatus.DRAFT,
      subtotal,
      tax,
      discount,
      grandTotal,
      reason: data.reason ?? null,
      createdBy: data.createdBy,
      items: {
        create: itemsData,
      },
    },
    select: SELECT,
  });

  return mapPurchaseReturn(created);
}

export async function updatePurchaseReturnStatus(
  id: string,
  status: PurchaseReturnStatus,
  tx?: Prisma.TransactionClient,
): Promise<MappedPurchaseReturn> {
  const client = tx ?? prisma;
  const updated = await client.purchaseReturn.update({
    where: { id },
    data: { status },
    select: SELECT,
  });
  return mapPurchaseReturn(updated);
}

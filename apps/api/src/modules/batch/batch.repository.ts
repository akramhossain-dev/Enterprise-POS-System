import { Prisma, BatchStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { BatchQuery, CreateBatchBody } from './batch.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaBatchWithRelations } from './batch.mapper';

const SELECT = {
  id: true,
  companyId: true,
  warehouseId: true,
  productId: true,
  batchNumber: true,
  manufacturingDate: true,
  expiryDate: true,
  quantity: true,
  status: true,
  remarks: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  product: { select: { id: true, name: true, sku: true } },
  warehouse: { select: { id: true, name: true, code: true } },
} satisfies Prisma.BatchSelect;

export async function findBatches(
  query: BatchQuery,
): Promise<{ batches: PrismaBatchWithRelations[]; meta: ReturnType<typeof buildPaginationMeta> }> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  // expiringInDays filter: batches expiring in next N days
  const expiryFilter = query.expiringInDays
    ? {
        expiryDate: {
          gte: new Date(),
          lte: new Date(Date.now() + query.expiringInDays * 86400000),
        },
      }
    : {};

  const where: Prisma.BatchWhereInput = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
    ...(query.productId ? { productId: query.productId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...expiryFilter,
  };

  const [batches, total] = await prisma.$transaction([
    prisma.batch.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: query.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.batch.count({ where }),
  ]);
  return {
    batches: batches as unknown as PrismaBatchWithRelations[],
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function findBatchById(id: string): Promise<PrismaBatchWithRelations | null> {
  return prisma.batch.findUnique({ where: { id }, select: SELECT });
}

export async function findBatchByNumber(
  warehouseId: string,
  productId: string,
  batchNumber: string,
): Promise<{ id: string } | null> {
  return prisma.batch.findUnique({
    where: { warehouseId_productId_batchNumber: { warehouseId, productId, batchNumber } },
    select: { id: true },
  });
}

export async function createBatch(
  data: CreateBatchBody & { createdBy: string },
): Promise<PrismaBatchWithRelations> {
  return prisma.batch.create({
    data: {
      companyId: data.companyId,
      warehouseId: data.warehouseId,
      productId: data.productId,
      batchNumber: data.batchNumber,
      quantity: data.quantity,
      ...(data.manufacturingDate ? { manufacturingDate: new Date(data.manufacturingDate) } : {}),
      ...(data.expiryDate ? { expiryDate: new Date(data.expiryDate) } : {}),
      ...(data.remarks ? { remarks: data.remarks } : {}),
      createdBy: data.createdBy,
    },
    select: SELECT,
  });
}

export async function updateBatchStatus(
  id: string,
  status: BatchStatus,
  remarks?: string,
): Promise<PrismaBatchWithRelations> {
  return prisma.batch.update({
    where: { id },
    data: { status, ...(remarks ? { remarks } : {}) },
    select: SELECT,
  });
}

// Auto-expire batches past their expiry date
export async function markExpiredBatches(): Promise<number> {
  const result = await prisma.batch.updateMany({
    where: { status: BatchStatus.ACTIVE, expiryDate: { lt: new Date() } },
    data: { status: BatchStatus.EXPIRED },
  });
  return result.count;
}

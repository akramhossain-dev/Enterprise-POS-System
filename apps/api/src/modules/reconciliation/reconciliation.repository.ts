import { Prisma, ReconciliationStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ReconciliationQuery } from './reconciliation.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaReconWithRelations } from './reconciliation.mapper';

const STOCK_TAKE_SELECT = {
  id: true,
  companyId: true,
  warehouseId: true,
  title: true,
  status: true,
  createdBy: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  warehouse: { select: { id: true, name: true, code: true } },
  items: {
    select: {
      id: true,
      stockTakeId: true,
      productId: true,
      systemQuantity: true,
      physicalQuantity: true,
      variance: true,
      remarks: true,
      product: { select: { id: true, name: true, sku: true } },
    },
  },
} satisfies Prisma.StockTakeSelect;

const SELECT = {
  id: true,
  companyId: true,
  stockTakeId: true,
  status: true,
  remarks: true,
  approvedBy: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  stockTake: { select: STOCK_TAKE_SELECT },
} satisfies Prisma.ReconciliationSelect;

export async function findReconciliations(
  query: ReconciliationQuery,
): Promise<{ recons: PrismaReconWithRelations[]; meta: ReturnType<typeof buildPaginationMeta> }> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });
  const where: Prisma.ReconciliationWhereInput = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.createdBy ? { createdBy: query.createdBy } : {}),
  };
  const [recons, total] = await prisma.$transaction([
    prisma.reconciliation.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: query.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.reconciliation.count({ where }),
  ]);
  return {
    recons: recons as unknown as PrismaReconWithRelations[],
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function findReconciliationById(id: string): Promise<PrismaReconWithRelations | null> {
  return (await prisma.reconciliation.findUnique({
    where: { id },
    select: SELECT,
  })) as unknown as PrismaReconWithRelations | null;
}

export async function findReconciliationByStockTakeId(
  stockTakeId: string,
): Promise<{ id: string } | null> {
  return prisma.reconciliation.findUnique({ where: { stockTakeId }, select: { id: true } });
}

export async function createReconciliation(
  stockTakeId: string,
  companyId: string,
  createdBy: string,
  remarks?: string,
): Promise<PrismaReconWithRelations> {
  return (await prisma.reconciliation.create({
    data: { companyId, stockTakeId, createdBy, ...(remarks ? { remarks } : {}) },
    select: SELECT,
  })) as unknown as PrismaReconWithRelations;
}

export async function updateReconciliationStatus(
  id: string,
  status: ReconciliationStatus,
  approvedBy?: string,
  remarks?: string,
): Promise<PrismaReconWithRelations> {
  return (await prisma.reconciliation.update({
    where: { id },
    data: { status, ...(approvedBy ? { approvedBy } : {}), ...(remarks ? { remarks } : {}) },
    select: SELECT,
  })) as unknown as PrismaReconWithRelations;
}

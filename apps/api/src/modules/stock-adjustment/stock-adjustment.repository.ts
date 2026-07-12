// ─────────────────────────────────────────────
// Stock Adjustment Module — Repository
// ─────────────────────────────────────────────

import { Prisma, AdjustmentType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AdjustmentQuery } from './stock-adjustment.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaAdjustmentWithRelations } from './stock-adjustment.mapper';

const ADJUSTMENT_SELECT = {
  id: true,
  companyId: true,
  warehouseId: true,
  productId: true,
  type: true,
  quantity: true,
  reason: true,
  remarks: true,
  approvedBy: true,
  createdBy: true,
  createdAt: true,
  product: { select: { id: true, name: true, sku: true } },
  warehouse: { select: { id: true, name: true, code: true } },
} satisfies Prisma.StockAdjustmentSelect;

export async function findAdjustments(query: AdjustmentQuery): Promise<{
  adjustments: PrismaAdjustmentWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  const where: Prisma.StockAdjustmentWhereInput = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
    ...(query.productId ? { productId: query.productId } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.createdBy ? { createdBy: query.createdBy } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          createdAt: {
            ...(query.dateFrom ? { gte: query.dateFrom } : {}),
            ...(query.dateTo ? { lte: query.dateTo } : {}),
          },
        }
      : {}),
  };

  const [adjustments, total] = await prisma.$transaction([
    prisma.stockAdjustment.findMany({
      where,
      select: ADJUSTMENT_SELECT,
      orderBy: { createdAt: query.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.stockAdjustment.count({ where }),
  ]);

  return {
    adjustments: adjustments as unknown as PrismaAdjustmentWithRelations[],
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function findAdjustmentById(
  id: string,
): Promise<PrismaAdjustmentWithRelations | null> {
  const a = await prisma.stockAdjustment.findUnique({
    where: { id },
    select: ADJUSTMENT_SELECT,
  });
  return a;
}

export interface CreateAdjustmentData {
  companyId: string;
  warehouseId: string;
  productId: string;
  type: AdjustmentType;
  quantity: number;
  reason: string;
  remarks?: string | undefined;
  createdBy: string;
  approvedBy?: string | undefined;
}

export async function createAdjustmentRecord(
  tx: Prisma.TransactionClient,
  data: CreateAdjustmentData,
): Promise<PrismaAdjustmentWithRelations> {
  const a = await tx.stockAdjustment.create({
    data: {
      companyId: data.companyId,
      warehouseId: data.warehouseId,
      productId: data.productId,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
      ...(data.remarks ? { remarks: data.remarks } : {}),
      createdBy: data.createdBy,
      ...(data.approvedBy ? { approvedBy: data.approvedBy } : {}),
    },
    select: ADJUSTMENT_SELECT,
  });
  return a;
}

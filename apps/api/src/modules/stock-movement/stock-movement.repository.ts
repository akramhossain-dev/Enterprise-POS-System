// ─────────────────────────────────────────────
// Stock Movement Module — Repository
// ─────────────────────────────────────────────

import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { StockMovementListOptions } from './stock-movement.types';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaMovementWithRelations } from './stock-movement.mapper';

const MOVEMENT_SELECT = {
  id: true,
  companyId: true,
  branchId: true,
  warehouseId: true,
  productId: true,
  movementType: true,
  referenceType: true,
  referenceId: true,
  quantity: true,
  previousQuantity: true,
  newQuantity: true,
  unitCost: true,
  remarks: true,
  performedBy: true,
  createdAt: true,
  product: { select: { id: true, name: true, sku: true } },
  warehouse: { select: { id: true, name: true, code: true } },
} satisfies Prisma.StockMovementSelect;

export async function findMovements(options: StockMovementListOptions): Promise<{
  movements: PrismaMovementWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: options.page ?? 1, limit: options.limit ?? 20 });

  const where: Prisma.StockMovementWhereInput = {
    ...(options.companyId ? { companyId: options.companyId } : {}),
    ...(options.warehouseId ? { warehouseId: options.warehouseId } : {}),
    ...(options.productId ? { productId: options.productId } : {}),
    ...(options.movementType ? { movementType: options.movementType } : {}),
    ...(options.referenceType ? { referenceType: options.referenceType } : {}),
    ...(options.referenceId ? { referenceId: options.referenceId } : {}),
    ...(options.performedBy ? { performedBy: options.performedBy } : {}),
    ...(options.dateFrom || options.dateTo
      ? {
          createdAt: {
            ...(options.dateFrom ? { gte: options.dateFrom } : {}),
            ...(options.dateTo ? { lte: options.dateTo } : {}),
          },
        }
      : {}),
  };

  const [movements, total] = await prisma.$transaction([
    prisma.stockMovement.findMany({
      where,
      select: MOVEMENT_SELECT,
      orderBy: { createdAt: options.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return {
    movements: movements as unknown as PrismaMovementWithRelations[],
    meta: buildPaginationMeta(options.page ?? 1, options.limit ?? 20, total),
  };
}

export async function findMovementById(id: string): Promise<PrismaMovementWithRelations | null> {
  const m = await prisma.stockMovement.findUnique({
    where: { id },
    select: MOVEMENT_SELECT,
  });
  return m;
}

export async function findMovementsByProduct(
  productId: string,
  options: { page?: number; limit?: number } = {},
): Promise<{
  movements: PrismaMovementWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  return findMovements({ productId, ...options });
}

export async function findMovementsByWarehouse(
  warehouseId: string,
  options: { page?: number; limit?: number } = {},
): Promise<{
  movements: PrismaMovementWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  return findMovements({ warehouseId, ...options });
}

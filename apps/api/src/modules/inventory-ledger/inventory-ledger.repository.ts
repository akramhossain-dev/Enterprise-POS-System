import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { LedgerQuery } from './inventory-ledger.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaLedgerWithRelations } from './inventory-ledger.mapper';

const SELECT = {
  id: true,
  companyId: true,
  warehouseId: true,
  productId: true,
  movementId: true,
  runningQuantity: true,
  runningValue: true,
  createdAt: true,
  product: { select: { id: true, name: true, sku: true } },
  warehouse: { select: { id: true, name: true, code: true } },
  movement: { select: { id: true, movementType: true, quantity: true } },
} satisfies Prisma.InventoryLedgerSelect;

export async function findLedgerEntries(query: LedgerQuery): Promise<{
  entries: PrismaLedgerWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  const where: Prisma.InventoryLedgerWhereInput = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
    ...(query.productId ? { productId: query.productId } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          createdAt: {
            ...(query.dateFrom ? { gte: query.dateFrom } : {}),
            ...(query.dateTo ? { lte: query.dateTo } : {}),
          },
        }
      : {}),
  };

  const [entries, total] = await prisma.$transaction([
    prisma.inventoryLedger.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: query.sortOrder ?? 'asc' },
      skip,
      take,
    }),
    prisma.inventoryLedger.count({ where }),
  ]);

  return {
    entries: entries as unknown as PrismaLedgerWithRelations[],
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function findLedgerById(id: string): Promise<PrismaLedgerWithRelations | null> {
  const e = await prisma.inventoryLedger.findUnique({ where: { id }, select: SELECT });
  return e;
}

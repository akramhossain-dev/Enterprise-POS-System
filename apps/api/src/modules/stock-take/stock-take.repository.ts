import { Prisma, StockTakeStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { StockTakeQuery, CreateStockTakeBody } from './stock-take.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaStockTakeWithRelations } from './stock-take.mapper';

const ITEM_SELECT = {
  id: true,
  stockTakeId: true,
  productId: true,
  systemQuantity: true,
  physicalQuantity: true,
  variance: true,
  remarks: true,
  product: { select: { id: true, name: true, sku: true } },
};

const SELECT = {
  id: true,
  companyId: true,
  warehouseId: true,
  title: true,
  status: true,
  conductedBy: true,
  createdBy: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  warehouse: { select: { id: true, name: true, code: true } },
  items: { select: ITEM_SELECT, orderBy: { product: { name: 'asc' as const } } },
} satisfies Prisma.StockTakeSelect;

export async function findStockTakes(query: StockTakeQuery): Promise<{
  stockTakes: PrismaStockTakeWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });
  const where: Prisma.StockTakeWhereInput = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.createdBy ? { createdBy: query.createdBy } : {}),
  };
  const [stockTakes, total] = await prisma.$transaction([
    prisma.stockTake.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: query.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.stockTake.count({ where }),
  ]);
  return {
    stockTakes: stockTakes as unknown as PrismaStockTakeWithRelations[],
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function findStockTakeById(id: string): Promise<PrismaStockTakeWithRelations | null> {
  return prisma.stockTake.findUnique({ where: { id }, select: SELECT });
}

export async function createStockTake(
  data: CreateStockTakeBody & { createdBy: string },
): Promise<PrismaStockTakeWithRelations> {
  return prisma.stockTake.create({
    data: {
      companyId: data.companyId,
      warehouseId: data.warehouseId,
      title: data.title,
      createdBy: data.createdBy,
      ...(data.conductedBy ? { conductedBy: data.conductedBy } : {}),
    },
    select: SELECT,
  });
}

export async function upsertStockTakeItem(
  stockTakeId: string,
  productId: string,
  systemQuantity: number,
  physicalQuantity: number,
  remarks?: string,
): Promise<void> {
  const variance = physicalQuantity - systemQuantity;
  await prisma.stockTakeItem.upsert({
    where: { stockTakeId_productId: { stockTakeId, productId } },
    create: {
      stockTakeId,
      productId,
      systemQuantity,
      physicalQuantity,
      variance,
      ...(remarks ? { remarks } : {}),
    },
    update: { physicalQuantity, variance, ...(remarks ? { remarks } : {}) },
  });
}

export async function updateStockTakeStatus(
  id: string,
  status: StockTakeStatus,
  completedAt?: Date,
): Promise<PrismaStockTakeWithRelations> {
  return prisma.stockTake.update({
    where: { id },
    data: { status, ...(completedAt ? { completedAt } : {}) },
    select: SELECT,
  });
}

// Auto-populate items from current inventory
export async function populateItemsFromInventory(
  stockTakeId: string,
  warehouseId: string,
  companyId: string,
): Promise<number> {
  const inventories = await prisma.inventory.findMany({
    where: { warehouseId, companyId },
    select: { productId: true, availableQuantity: true },
  });

  await prisma.stockTakeItem.createMany({
    data: inventories.map((inv) => ({
      stockTakeId,
      productId: inv.productId,
      systemQuantity: inv.availableQuantity,
    })),
    skipDuplicates: true,
  });

  return inventories.length;
}

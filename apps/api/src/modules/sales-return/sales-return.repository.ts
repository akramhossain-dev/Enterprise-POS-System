import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { SalesReturnQuery } from './sales-return.schema';
import { PrismaSalesReturnWithRelations } from './sales-return.mapper';
import { paginate, buildPaginationMeta } from '../../common/utils/query';

const SELECT_RELATIONS = {
  customer: { select: { fullName: true } },
  sale: { select: { invoiceNumber: true } },
  items: {
    include: {
      product: { select: { name: true, sku: true } },
    },
  },
} satisfies Prisma.SalesReturnInclude;

export async function findSalesReturnById(
  id: string,
  tx?: Prisma.TransactionClient,
): Promise<PrismaSalesReturnWithRelations | null> {
  const client = tx ?? prisma;
  return client.salesReturn.findUnique({
    where: { id },
    include: SELECT_RELATIONS,
  });
}

export async function generateReturnNumber(
  companyId: string,
  tx: Prisma.TransactionClient,
): Promise<string> {
  const count = await tx.salesReturn.count({
    where: { companyId },
  });
  const seq = String(count + 1).padStart(6, '0');
  return `SR-${seq}`;
}

export async function getAlreadyReturnedQuantity(
  saleItemId: string,
  tx?: Prisma.TransactionClient,
): Promise<number> {
  const client = tx ?? prisma;
  const result = await client.salesReturnItem.aggregate({
    where: {
      saleItemId,
      salesReturn: {
        status: {
          in: ['DRAFT', 'APPROVED', 'COMPLETED'],
        },
      },
    },
    _sum: {
      quantity: true,
    },
  });
  return Number(result._sum.quantity ?? 0);
}

export async function findSalesReturns(
  companyId: string,
  query: SalesReturnQuery,
): Promise<{
  returns: PrismaSalesReturnWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  const where: Prisma.SalesReturnWhereInput = {
    companyId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.saleId ? { saleId: query.saleId } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
  };

  const [returns, total] = await Promise.all([
    prisma.salesReturn.findMany({
      where,
      include: SELECT_RELATIONS,
      orderBy: { returnDate: 'desc' },
      skip,
      take,
    }),
    prisma.salesReturn.count({ where }),
  ]);

  return {
    returns,
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

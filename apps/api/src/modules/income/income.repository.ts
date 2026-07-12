import { prisma } from '../../lib/prisma';
import { Prisma, Income } from '@prisma/client';
import { MappedIncome, IncomeQuery } from './income.types';
import { buildPaginationMeta, paginate } from '../../common/utils/query';

type PrismaIncomeWithRelations = Income & {
  account: { id: string; accountCode: string; name: string };
  creator: { id: string; name: string };
};

export function mapIncome(inc: PrismaIncomeWithRelations): MappedIncome {
  return {
    id: inc.id,
    incomeNumber: inc.incomeNumber,
    account: {
      id: inc.account.id,
      accountCode: inc.account.accountCode,
      name: inc.account.name,
    },
    date: inc.date.toISOString(),
    amount: inc.amount.toString(),
    source: inc.source,
    paymentMethod: inc.paymentMethod,
    reference: inc.reference,
    description: inc.description,
    status: inc.status,
    creator: {
      id: inc.creator.id,
      name: inc.creator.name,
    },
    createdAt: inc.createdAt.toISOString(),
    updatedAt: inc.updatedAt.toISOString(),
  };
}

export async function generateIncomeNumber(
  companyId: string,
  tx: Prisma.TransactionClient,
): Promise<string> {
  const count = await tx.income.count({
    where: { companyId },
  });
  const seq = String(count + 1).padStart(6, '0');
  return `INC-${seq}`;
}

export async function findIncomeById(
  id: string,
  tx?: Prisma.TransactionClient,
): Promise<PrismaIncomeWithRelations | null> {
  const client = tx ?? prisma;
  return client.income.findUnique({
    where: { id },
    include: {
      account: { select: { id: true, accountCode: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  });
}

export async function findIncomes(
  companyId: string,
  query: IncomeQuery,
): Promise<{
  incomes: PrismaIncomeWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const { skip, take } = paginate({ page, limit });

  const where: Prisma.IncomeWhereInput = {
    companyId,
    ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          date: {
            ...(query.dateFrom ? { gte: query.dateFrom } : {}),
            ...(query.dateTo ? { lte: query.dateTo } : {}),
          },
        }
      : {}),
    ...(query.amountMin !== undefined || query.amountMax !== undefined
      ? {
          amount: {
            ...(query.amountMin !== undefined ? { gte: query.amountMin } : {}),
            ...(query.amountMax !== undefined ? { lte: query.amountMax } : {}),
          },
        }
      : {}),
    ...(query.search
      ? {
          OR: [
            { incomeNumber: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { source: { contains: query.search, mode: 'insensitive' } },
            { reference: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [incomes, total] = await Promise.all([
    prisma.income.findMany({
      where,
      include: {
        account: { select: { id: true, accountCode: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      skip,
      take,
    }),
    prisma.income.count({ where }),
  ]);

  return {
    incomes,
    meta: buildPaginationMeta(page, limit, total),
  };
}

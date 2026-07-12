import { prisma } from '../../lib/prisma';
import { Prisma, Account, AccountCategory } from '@prisma/client';
import { MappedAccount, MappedAccountCategory, AccountQuery } from './account.types';
import { paginate, buildPaginationMeta } from '../../common/utils/query';

export function mapAccountCategory(cat: AccountCategory): MappedAccountCategory {
  return {
    id: cat.id,
    companyId: cat.companyId,
    name: cat.name,
    type: cat.type,
    createdAt: cat.createdAt.toISOString(),
  };
}

export type PrismaAccountWithRelations = Prisma.AccountGetPayload<{
  include: {
    category: { select: { name: true } };
    parent: { select: { name: true } };
  };
}>;

export function mapAccount(acc: PrismaAccountWithRelations): MappedAccount {
  return {
    id: acc.id,
    companyId: acc.companyId,
    categoryId: acc.categoryId,
    categoryName: acc.category.name,
    parentId: acc.parentId,
    parentName: acc.parent?.name ?? null,
    accountCode: acc.accountCode,
    name: acc.name,
    type: acc.type,
    openingBalance: acc.openingBalance.toString(),
    currentBalance: acc.currentBalance.toString(),
    status: acc.status,
    createdAt: acc.createdAt.toISOString(),
    updatedAt: acc.updatedAt.toISOString(),
  };
}

export async function findAccountById(
  id: string,
  tx?: Prisma.TransactionClient,
): Promise<PrismaAccountWithRelations | null> {
  const client = tx ?? prisma;
  return client.account.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      parent: { select: { name: true } },
    },
  });
}

export async function findAccountByCode(
  companyId: string,
  accountCode: string,
  tx?: Prisma.TransactionClient,
): Promise<Account | null> {
  const client = tx ?? prisma;
  return client.account.findUnique({
    where: {
      companyId_accountCode: {
        companyId,
        accountCode,
      },
    },
  });
}

export async function findAccounts(
  companyId: string,
  query: AccountQuery,
): Promise<{
  accounts: PrismaAccountWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const { skip, take } = paginate({ page, limit });

  const where: Prisma.AccountWhereInput = {
    companyId,
    ...(query.type ? { type: query.type } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { accountCode: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where,
      include: {
        category: { select: { name: true } },
        parent: { select: { name: true } },
      },
      orderBy: { accountCode: 'asc' },
      skip,
      take,
    }),
    prisma.account.count({ where }),
  ]);

  return {
    accounts,
    meta: buildPaginationMeta(page, limit, total),
  };
}

export async function findCategories(companyId: string): Promise<AccountCategory[]> {
  return prisma.accountCategory.findMany({
    where: { companyId },
    orderBy: { name: 'asc' },
  });
}

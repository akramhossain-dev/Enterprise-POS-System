import { prisma } from '../../lib/prisma';
import { Prisma, ExpenseCategory, Expense } from '@prisma/client';
import {
  MappedExpense,
  MappedExpenseCategory,
  ExpenseQuery,
  ExpenseCategoryQuery,
} from './expense.types';
import { buildPaginationMeta } from '../../common/utils/query';
import { paginate } from '../../common/utils/query';

// Type alias for relations
type PrismaExpenseWithRelations = Expense & {
  category: { id: string; name: string };
  account: { id: string; accountCode: string; name: string };
  creator: { id: string; name: string };
};

// ── Mappings ────────────────────────────────────────────────────────────────
export function mapExpenseCategory(cat: ExpenseCategory): MappedExpenseCategory {
  return {
    id: cat.id,
    name: cat.name,
    description: cat.description,
    status: cat.status,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  };
}

export function mapExpense(exp: PrismaExpenseWithRelations): MappedExpense {
  return {
    id: exp.id,
    expenseNumber: exp.expenseNumber,
    category: {
      id: exp.category.id,
      name: exp.category.name,
    },
    account: {
      id: exp.account.id,
      accountCode: exp.account.accountCode,
      name: exp.account.name,
    },
    date: exp.date.toISOString(),
    amount: exp.amount.toString(),
    paymentMethod: exp.paymentMethod,
    reference: exp.reference,
    description: exp.description,
    attachment: exp.attachment,
    status: exp.status,
    creator: {
      id: exp.creator.id,
      name: exp.creator.name,
    },
    createdAt: exp.createdAt.toISOString(),
    updatedAt: exp.updatedAt.toISOString(),
  };
}

// ── Category Repository ─────────────────────────────────────────────────────
export async function findCategoryById(
  id: string,
  tx?: Prisma.TransactionClient,
): Promise<ExpenseCategory | null> {
  const client = tx ?? prisma;
  return client.expenseCategory.findUnique({
    where: { id },
  });
}

export async function findCategoryByName(
  companyId: string,
  name: string,
  tx?: Prisma.TransactionClient,
): Promise<ExpenseCategory | null> {
  const client = tx ?? prisma;
  return client.expenseCategory.findFirst({
    where: {
      companyId,
      name: { equals: name, mode: 'insensitive' },
    },
  });
}

export async function findCategories(
  companyId: string,
  query: ExpenseCategoryQuery,
): Promise<ExpenseCategory[]> {
  return prisma.expenseCategory.findMany({
    where: {
      companyId,
      ...(query.status ? { status: query.status } : {}),
    },
    orderBy: { name: 'asc' },
  });
}

// ── Expense Repository ──────────────────────────────────────────────────────
export async function generateExpenseNumber(
  companyId: string,
  tx: Prisma.TransactionClient,
): Promise<string> {
  const count = await tx.expense.count({
    where: { companyId },
  });
  const seq = String(count + 1).padStart(6, '0');
  return `EXP-${seq}`;
}

export async function findExpenseById(
  id: string,
  tx?: Prisma.TransactionClient,
): Promise<PrismaExpenseWithRelations | null> {
  const client = tx ?? prisma;
  return client.expense.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      account: { select: { id: true, accountCode: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  });
}

export async function findExpenses(
  companyId: string,
  query: ExpenseQuery,
): Promise<{
  expenses: PrismaExpenseWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const { skip, take } = paginate({ page, limit });

  const where: Prisma.ExpenseWhereInput = {
    companyId,
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
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
            { expenseNumber: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { reference: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        account: { select: { id: true, accountCode: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      skip,
      take,
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    expenses,
    meta: buildPaginationMeta(page, limit, total),
  };
}

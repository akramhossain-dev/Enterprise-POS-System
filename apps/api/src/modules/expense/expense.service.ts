import { prisma } from '../../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { AccountType, ExpenseStatus, ExpenseCategoryStatus, Prisma } from '@prisma/client';
import {
  CreateExpenseCategoryPayload,
  UpdateExpenseCategoryPayload,
  CreateExpensePayload,
  UpdateExpensePayload,
} from './expense.schema';
import {
  MappedExpense,
  MappedExpenseCategory,
  ExpenseQuery,
  ExpenseCategoryQuery,
} from './expense.types';
import {
  findCategoryById,
  findCategoryByName,
  findCategories,
  findExpenseById,
  findExpenses,
  generateExpenseNumber,
  mapExpense,
  mapExpenseCategory,
} from './expense.repository';
import { buildPaginationMeta } from '../../common/utils/query';

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new ForbiddenError('User is not associated with any company');
  }
  return employee.companyId;
}

// ── Expense Category Services ───────────────────────────────────────────────
export async function createExpenseCategory(
  payload: CreateExpenseCategoryPayload,
  userId: string,
): Promise<MappedExpenseCategory> {
  const companyId = await getCompanyIdForUser(userId);

  const existing = await findCategoryByName(companyId, payload.name);
  if (existing) {
    throw new BadRequestError(`Expense category "${payload.name}" already exists`);
  }

  const cat = await prisma.expenseCategory.create({
    data: {
      companyId,
      name: payload.name,
      description: payload.description ?? null,
      status: payload.status ?? 'ACTIVE',
    },
  });

  console.warn(`[AUDIT] Expense Category Created: ${cat.id}`);
  return mapExpenseCategory(cat);
}

export async function listExpenseCategories(
  userId: string,
  query: ExpenseCategoryQuery = {},
): Promise<MappedExpenseCategory[]> {
  const companyId = await getCompanyIdForUser(userId);
  const categories = await findCategories(companyId, query);
  return categories.map(mapExpenseCategory);
}

export async function updateExpenseCategory(
  id: string,
  payload: UpdateExpenseCategoryPayload,
  userId: string,
): Promise<MappedExpenseCategory> {
  const companyId = await getCompanyIdForUser(userId);

  const category = await findCategoryById(id);
  if (category?.companyId !== companyId) {
    throw new NotFoundError(`Expense category with ID "${id}" not found`);
  }

  if (payload.name && payload.name !== category.name) {
    const existing = await findCategoryByName(companyId, payload.name);
    if (existing) {
      throw new BadRequestError(`Expense category "${payload.name}" already exists`);
    }
  }

  const updateData: Prisma.ExpenseCategoryUpdateInput = {};
  if (payload.name !== undefined) {
    updateData.name = payload.name;
  }
  if (payload.description !== undefined) {
    updateData.description = payload.description;
  }
  if (payload.status !== undefined) {
    updateData.status = payload.status;
  }

  const updated = await prisma.expenseCategory.update({
    where: { id },
    data: updateData,
  });

  console.warn(`[AUDIT] Expense Category Updated: ${id}`);
  return mapExpenseCategory(updated);
}

// ── Expense Entries Services ────────────────────────────────────────────────
export async function createExpense(
  payload: CreateExpensePayload,
  userId: string,
): Promise<MappedExpense> {
  const companyId = await getCompanyIdForUser(userId);

  // 1. Validate category exists and is ACTIVE
  const category = await findCategoryById(payload.categoryId);
  if (category?.companyId !== companyId) {
    throw new BadRequestError(`Expense category not found`);
  }
  if (category.status !== ExpenseCategoryStatus.ACTIVE) {
    throw new BadRequestError(`Expense category "${category.name}" is inactive`);
  }

  // 2. Validate expense account exists and is of type EXPENSE
  const expenseAccount = await prisma.account.findFirst({
    where: { id: payload.accountId, companyId },
  });
  if (!expenseAccount) {
    throw new BadRequestError(`Expense account not found`);
  }
  if (expenseAccount.type !== AccountType.EXPENSE) {
    throw new BadRequestError(`Selected account must be of type EXPENSE`);
  }
  if (expenseAccount.status !== 'ACTIVE') {
    throw new BadRequestError(`Expense account "${expenseAccount.name}" is inactive`);
  }

  // 3. Resolve Asset account based on paymentMethod
  const assetCode = payload.paymentMethod === 'CASH' ? '1000' : '1100';
  const assetAccount = await prisma.account.findFirst({
    where: { companyId, accountCode: assetCode },
  });
  if (!assetAccount) {
    throw new BadRequestError(
      `Asset account for code "${assetCode}" (payment method ${payload.paymentMethod}) not found. Please verify seeding.`,
    );
  }

  // 4. Perform atomic creation in database transaction
  const created = await prisma.$transaction(async (tx) => {
    const expenseNumber = await generateExpenseNumber(companyId, tx);

    const expense = await tx.expense.create({
      data: {
        companyId,
        branchId: payload.branchId ?? null,
        categoryId: payload.categoryId,
        accountId: payload.accountId,
        expenseNumber,
        date: payload.date,
        amount: payload.amount,
        paymentMethod: payload.paymentMethod,
        reference: payload.reference ?? null,
        description: payload.description ?? null,
        attachment: payload.attachment ?? null,
        status: 'ACTIVE',
        createdBy: userId,
      },
    });

    // Post balanced double-entry Journal Entry
    const entryCount = await tx.journalEntry.count({ where: { companyId } });
    const entryNumber = `JE-${String(entryCount + 1).padStart(6, '0')}`;

    const journal = await tx.journalEntry.create({
      data: {
        companyId,
        referenceType: 'EXPENSE',
        referenceId: expense.id,
        entryNumber,
        date: payload.date,
        description: payload.description ?? `Expense recorded: ${category.name}`,
        createdBy: userId,
      },
    });

    // Debit the Expense Account (increases balance)
    await tx.journalEntryItem.create({
      data: {
        journalEntryId: journal.id,
        accountId: payload.accountId,
        debit: payload.amount,
        credit: 0,
      },
    });

    await tx.account.update({
      where: { id: payload.accountId },
      data: {
        currentBalance: { increment: payload.amount },
      },
    });

    // Credit the Asset Account (decreases balance)
    await tx.journalEntryItem.create({
      data: {
        journalEntryId: journal.id,
        accountId: assetAccount.id,
        debit: 0,
        credit: payload.amount,
      },
    });

    await tx.account.update({
      where: { id: assetAccount.id },
      data: {
        currentBalance: { decrement: payload.amount },
      },
    });

    console.warn(`[AUDIT] Journal Posted: ${journal.id}`);
    return expense;
  });

  const fresh = await findExpenseById(created.id);
  if (!fresh) {
    throw new NotFoundError('Failed to fetch newly created expense details');
  }

  console.warn(`[AUDIT] Expense Created: ${created.id}`);
  return mapExpense(fresh);
}

export async function listExpenses(
  userId: string,
  query: ExpenseQuery,
): Promise<{
  expenses: MappedExpense[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const companyId = await getCompanyIdForUser(userId);
  const { expenses, meta } = await findExpenses(companyId, query);
  return { expenses: expenses.map(mapExpense), meta };
}

export async function getExpenseDetails(id: string, userId: string): Promise<MappedExpense> {
  const companyId = await getCompanyIdForUser(userId);
  const expense = await findExpenseById(id);
  if (expense?.companyId !== companyId) {
    throw new NotFoundError(`Expense with ID "${id}" not found`);
  }
  return mapExpense(expense);
}

export async function updateExpense(
  id: string,
  payload: UpdateExpensePayload,
  userId: string,
): Promise<MappedExpense> {
  const companyId = await getCompanyIdForUser(userId);

  const expense = await findExpenseById(id);
  if (expense?.companyId !== companyId) {
    throw new NotFoundError(`Expense with ID "${id}" not found`);
  }

  if (expense.status === ExpenseStatus.CANCELLED) {
    throw new BadRequestError('Cannot update a cancelled expense');
  }

  const updated = await prisma.$transaction(async (tx) => {
    // If status is updated to CANCELLED, we reverse the journal entry
    if (payload.status === ExpenseStatus.CANCELLED) {
      // Find asset account matching original payment method
      const assetCode = expense.paymentMethod === 'CASH' ? '1000' : '1100';
      const assetAccount = await tx.account.findFirst({
        where: { companyId, accountCode: assetCode },
      });
      if (!assetAccount) {
        throw new BadRequestError(`Asset account for code "${assetCode}" not found`);
      }

      // Reverse Journal Entry: Credit Expense Account, Debit Cash/Bank
      const entryCount = await tx.journalEntry.count({ where: { companyId } });
      const entryNumber = `JE-${String(entryCount + 1).padStart(6, '0')}`;

      const journal = await tx.journalEntry.create({
        data: {
          companyId,
          referenceType: 'EXPENSE_REVERSAL',
          referenceId: expense.id,
          entryNumber,
          date: new Date(),
          description: `Reversal of Expense ${expense.expenseNumber}`,
          createdBy: userId,
        },
      });

      // Credit Expense Account (decreases balance)
      await tx.journalEntryItem.create({
        data: {
          journalEntryId: journal.id,
          accountId: expense.accountId,
          debit: 0,
          credit: expense.amount,
        },
      });

      await tx.account.update({
        where: { id: expense.accountId },
        data: {
          currentBalance: { decrement: expense.amount },
        },
      });

      // Debit Asset Account (increases balance)
      await tx.journalEntryItem.create({
        data: {
          journalEntryId: journal.id,
          accountId: assetAccount.id,
          debit: expense.amount,
          credit: 0,
        },
      });

      await tx.account.update({
        where: { id: assetAccount.id },
        data: {
          currentBalance: { increment: expense.amount },
        },
      });

      console.warn(`[AUDIT] Journal Posted (Reversal): ${journal.id}`);
    }

    const updateData: Prisma.ExpenseUpdateInput = {};
    if (payload.reference !== undefined) {
      updateData.reference = payload.reference;
    }
    if (payload.description !== undefined) {
      updateData.description = payload.description;
    }
    if (payload.attachment !== undefined) {
      updateData.attachment = payload.attachment;
    }
    if (payload.status !== undefined) {
      updateData.status = payload.status;
    }

    return tx.expense.update({
      where: { id },
      data: updateData,
    });
  });

  const fresh = await findExpenseById(updated.id);
  if (!fresh) {
    throw new NotFoundError('Failed to fetch updated expense details');
  }

  console.warn(`[AUDIT] Expense Updated: ${id}`);
  return mapExpense(fresh);
}

export async function deleteExpense(id: string, userId: string): Promise<void> {
  const companyId = await getCompanyIdForUser(userId);

  const expense = await findExpenseById(id);
  if (expense?.companyId !== companyId) {
    throw new NotFoundError(`Expense with ID "${id}" not found`);
  }

  await prisma.$transaction(async (tx) => {
    // If expense was ACTIVE, we must reverse the ledger balance changes
    if (expense.status === ExpenseStatus.ACTIVE) {
      const assetCode = expense.paymentMethod === 'CASH' ? '1000' : '1100';
      const assetAccount = await tx.account.findFirst({
        where: { companyId, accountCode: assetCode },
      });
      if (!assetAccount) {
        throw new BadRequestError(`Asset account for code "${assetCode}" not found`);
      }

      // Revert Expense Account (Decrement balance)
      await tx.account.update({
        where: { id: expense.accountId },
        data: {
          currentBalance: { decrement: expense.amount },
        },
      });

      // Revert Asset Account (Increment balance)
      await tx.account.update({
        where: { id: assetAccount.id },
        data: {
          currentBalance: { increment: expense.amount },
        },
      });
    }

    // Delete associated journal entries
    const journalEntries = await tx.journalEntry.findMany({
      where: {
        companyId,
        referenceId: expense.id,
        referenceType: { in: ['EXPENSE', 'EXPENSE_REVERSAL'] },
      },
    });

    for (const journal of journalEntries) {
      await tx.journalEntryItem.deleteMany({ where: { journalEntryId: journal.id } });
      await tx.journalEntry.delete({ where: { id: journal.id } });
    }

    // Delete the expense entry
    await tx.expense.delete({
      where: { id },
    });
  });

  console.warn(`[AUDIT] Expense Deleted: ${id}`);
}

import { prisma } from '../../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { AccountType, IncomeStatus, Prisma } from '@prisma/client';
import { CreateIncomePayload, UpdateIncomePayload } from './income.schema';
import { MappedIncome, IncomeQuery } from './income.types';
import { findIncomeById, findIncomes, generateIncomeNumber, mapIncome } from './income.repository';
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

// ── Income Services ─────────────────────────────────────────────────────────
export async function createIncome(
  payload: CreateIncomePayload,
  userId: string,
): Promise<MappedIncome> {
  const companyId = await getCompanyIdForUser(userId);

  // 1. Validate income account exists and is of type INCOME
  const incomeAccount = await prisma.account.findFirst({
    where: { id: payload.accountId, companyId },
  });
  if (!incomeAccount) {
    throw new BadRequestError(`Income account not found`);
  }
  if (incomeAccount.type !== AccountType.INCOME) {
    throw new BadRequestError(`Selected account must be of type INCOME`);
  }
  if (incomeAccount.status !== 'ACTIVE') {
    throw new BadRequestError(`Income account "${incomeAccount.name}" is inactive`);
  }

  // 2. Resolve Asset account based on paymentMethod
  const assetCode = payload.paymentMethod === 'CASH' ? '1000' : '1100';
  const assetAccount = await prisma.account.findFirst({
    where: { companyId, accountCode: assetCode },
  });
  if (!assetAccount) {
    throw new BadRequestError(
      `Asset account for code "${assetCode}" (payment method ${payload.paymentMethod}) not found. Please verify seeding.`,
    );
  }

  // 3. Perform atomic creation in database transaction
  const created = await prisma.$transaction(async (tx) => {
    const incomeNumber = await generateIncomeNumber(companyId, tx);

    const income = await tx.income.create({
      data: {
        companyId,
        branchId: payload.branchId ?? null,
        accountId: payload.accountId,
        incomeNumber,
        date: payload.date,
        amount: payload.amount,
        paymentMethod: payload.paymentMethod,
        source: payload.source ?? null,
        reference: payload.reference ?? null,
        description: payload.description ?? null,
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
        referenceType: 'INCOME',
        referenceId: income.id,
        entryNumber,
        date: payload.date,
        description:
          payload.description ?? `Income recorded from: ${payload.source ?? 'Other Source'}`,
        createdBy: userId,
      },
    });

    // Debit the Asset Account (increases balance - Asset is Debit Normal)
    await tx.journalEntryItem.create({
      data: {
        journalEntryId: journal.id,
        accountId: assetAccount.id,
        debit: payload.amount,
        credit: 0,
      },
    });

    await tx.account.update({
      where: { id: assetAccount.id },
      data: {
        currentBalance: { increment: payload.amount },
      },
    });

    // Credit the Income Account (increases balance - Income is Credit Normal)
    await tx.journalEntryItem.create({
      data: {
        journalEntryId: journal.id,
        accountId: payload.accountId,
        debit: 0,
        credit: payload.amount,
      },
    });

    await tx.account.update({
      where: { id: payload.accountId },
      data: {
        currentBalance: { increment: payload.amount },
      },
    });

    console.warn(`[AUDIT] Journal Posted: ${journal.id}`);
    return income;
  });

  const fresh = await findIncomeById(created.id);
  if (!fresh) {
    throw new NotFoundError('Failed to fetch newly created income details');
  }

  console.warn(`[AUDIT] Income Created: ${created.id}`);
  return mapIncome(fresh);
}

export async function listIncomes(
  userId: string,
  query: IncomeQuery,
): Promise<{
  incomes: MappedIncome[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const companyId = await getCompanyIdForUser(userId);
  const { incomes, meta } = await findIncomes(companyId, query);
  return { incomes: incomes.map(mapIncome), meta };
}

export async function getIncomeDetails(id: string, userId: string): Promise<MappedIncome> {
  const companyId = await getCompanyIdForUser(userId);
  const income = await findIncomeById(id);
  if (income?.companyId !== companyId) {
    throw new NotFoundError(`Income with ID "${id}" not found`);
  }
  return mapIncome(income);
}

export async function updateIncome(
  id: string,
  payload: UpdateIncomePayload,
  userId: string,
): Promise<MappedIncome> {
  const companyId = await getCompanyIdForUser(userId);

  const income = await findIncomeById(id);
  if (income?.companyId !== companyId) {
    throw new NotFoundError(`Income with ID "${id}" not found`);
  }

  if (income.status === IncomeStatus.CANCELLED) {
    throw new BadRequestError('Cannot update a cancelled income');
  }

  const updated = await prisma.$transaction(async (tx) => {
    // If status is updated to CANCELLED, we reverse the journal entry
    if (payload.status === IncomeStatus.CANCELLED) {
      // Find asset account matching original payment method
      const assetCode = income.paymentMethod === 'CASH' ? '1000' : '1100';
      const assetAccount = await tx.account.findFirst({
        where: { companyId, accountCode: assetCode },
      });
      if (!assetAccount) {
        throw new BadRequestError(`Asset account for code "${assetCode}" not found`);
      }

      // Reverse Journal Entry: Debit Income (Credit normal decreases), Credit Asset (Debit normal decreases)
      const entryCount = await tx.journalEntry.count({ where: { companyId } });
      const entryNumber = `JE-${String(entryCount + 1).padStart(6, '0')}`;

      const journal = await tx.journalEntry.create({
        data: {
          companyId,
          referenceType: 'INCOME_REVERSAL',
          referenceId: income.id,
          entryNumber,
          date: new Date(),
          description: `Reversal of Income ${income.incomeNumber}`,
          createdBy: userId,
        },
      });

      // Debit Income Account (decreases balance)
      await tx.journalEntryItem.create({
        data: {
          journalEntryId: journal.id,
          accountId: income.accountId,
          debit: income.amount,
          credit: 0,
        },
      });

      await tx.account.update({
        where: { id: income.accountId },
        data: {
          currentBalance: { decrement: income.amount },
        },
      });

      // Credit Asset Account (decreases balance)
      await tx.journalEntryItem.create({
        data: {
          journalEntryId: journal.id,
          accountId: assetAccount.id,
          debit: 0,
          credit: income.amount,
        },
      });

      await tx.account.update({
        where: { id: assetAccount.id },
        data: {
          currentBalance: { decrement: income.amount },
        },
      });

      console.warn(`[AUDIT] Journal Posted (Reversal): ${journal.id}`);
    }

    const updateData: Prisma.IncomeUpdateInput = {};
    if (payload.source !== undefined) {
      updateData.source = payload.source;
    }
    if (payload.reference !== undefined) {
      updateData.reference = payload.reference;
    }
    if (payload.description !== undefined) {
      updateData.description = payload.description;
    }
    if (payload.status !== undefined) {
      updateData.status = payload.status;
    }

    return tx.income.update({
      where: { id },
      data: updateData,
    });
  });

  const fresh = await findIncomeById(updated.id);
  if (!fresh) {
    throw new NotFoundError('Failed to fetch updated income details');
  }

  console.warn(`[AUDIT] Income Updated: ${id}`);
  return mapIncome(fresh);
}

export async function deleteIncome(id: string, userId: string): Promise<void> {
  const companyId = await getCompanyIdForUser(userId);

  const income = await findIncomeById(id);
  if (income?.companyId !== companyId) {
    throw new NotFoundError(`Income with ID "${id}" not found`);
  }

  await prisma.$transaction(async (tx) => {
    // If income was ACTIVE, we must reverse the ledger balance changes
    if (income.status === IncomeStatus.ACTIVE) {
      const assetCode = income.paymentMethod === 'CASH' ? '1000' : '1100';
      const assetAccount = await tx.account.findFirst({
        where: { companyId, accountCode: assetCode },
      });
      if (!assetAccount) {
        throw new BadRequestError(`Asset account for code "${assetCode}" not found`);
      }

      // Revert Asset Account (Decrement balance)
      await tx.account.update({
        where: { id: assetAccount.id },
        data: {
          currentBalance: { decrement: income.amount },
        },
      });

      // Revert Income Account (Decrement balance)
      await tx.account.update({
        where: { id: income.accountId },
        data: {
          currentBalance: { decrement: income.amount },
        },
      });
    }

    // Delete associated journal entries
    const journalEntries = await tx.journalEntry.findMany({
      where: {
        companyId,
        referenceId: income.id,
        referenceType: { in: ['INCOME', 'INCOME_REVERSAL'] },
      },
    });

    for (const journal of journalEntries) {
      await tx.journalEntryItem.deleteMany({ where: { journalEntryId: journal.id } });
      await tx.journalEntry.delete({ where: { id: journal.id } });
    }

    // Delete the income entry
    await tx.income.delete({
      where: { id },
    });
  });

  console.warn(`[AUDIT] Income Deleted: ${id}`);
}

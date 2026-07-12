import { prisma } from '../../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { CreateJournalEntryPayload } from './journal.schema';
import { JournalEntry, AccountType } from '@prisma/client';
import { findJournalEntryById, generateEntryNumber } from './journal.repository';

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new ForbiddenError('User is not associated with any company profile');
  }
  return employee.companyId;
}

export async function createJournalEntry(
  payload: CreateJournalEntryPayload,
  userId: string,
): Promise<JournalEntry> {
  const companyId = await getCompanyIdForUser(userId);

  // 1. Balance validation
  const debitSum = payload.items.reduce((sum, item) => sum + item.debit, 0);
  const creditSum = payload.items.reduce((sum, item) => sum + item.credit, 0);
  if (Math.abs(debitSum - creditSum) > 0.0001) {
    throw new BadRequestError(
      `Journal entry does not balance. Total Debit (${debitSum.toFixed(4)}) must equal Total Credit (${creditSum.toFixed(4)}).`,
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // 2. Generate entry number
    const entryNumber = await generateEntryNumber(companyId, tx);

    // 3. Create entry header
    const entry = await tx.journalEntry.create({
      data: {
        companyId,
        referenceType: payload.referenceType ?? null,
        referenceId: payload.referenceId ?? null,
        entryNumber,
        date: payload.date,
        description: payload.description ?? null,
        createdBy: userId,
      },
    });

    // 4. Create items and update balances
    for (const item of payload.items) {
      const acc = await tx.account.findFirst({
        where: { id: item.accountId, companyId },
      });
      if (!acc) {
        throw new NotFoundError(`Ledger account with ID "${item.accountId}" not found`);
      }
      if (acc.status !== 'ACTIVE') {
        throw new BadRequestError(`Ledger account "${acc.name}" is not active`);
      }

      // Calculate balance delta based on double-entry rules
      let balanceDelta = 0;
      if (acc.type === AccountType.ASSET || acc.type === AccountType.EXPENSE) {
        balanceDelta = item.debit - item.credit;
      } else {
        balanceDelta = item.credit - item.debit;
      }

      // Update account current balance
      await tx.account.update({
        where: { id: acc.id },
        data: {
          currentBalance: {
            increment: balanceDelta,
          },
        },
      });

      // Write transaction line item
      await tx.journalEntryItem.create({
        data: {
          journalEntryId: entry.id,
          accountId: item.accountId,
          debit: item.debit,
          credit: item.credit,
        },
      });
    }

    return entry.id;
  });

  const fresh = await findJournalEntryById(result);
  if (!fresh) {
    throw new NotFoundError('Failed to retrieve posted journal entry');
  }

  console.warn(`[AUDIT] Journal Created: ${fresh.id}`);
  return fresh;
}

export async function getJournalEntryDetails(id: string, userId: string): Promise<JournalEntry> {
  const companyId = await getCompanyIdForUser(userId);
  const entry = await findJournalEntryById(id);
  if (entry?.companyId !== companyId) {
    throw new NotFoundError(`Journal Entry with ID "${id}" not found`);
  }
  return entry;
}

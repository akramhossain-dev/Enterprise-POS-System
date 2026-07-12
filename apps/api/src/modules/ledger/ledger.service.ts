import { prisma } from '../../lib/prisma';
import { NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { GeneralLedgerQuery, GeneralLedgerResponse } from './ledger.types';
import { AccountType, Prisma } from '@prisma/client';

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new ForbiddenError('User is not associated with any company profile');
  }
  return employee.companyId;
}

export async function getAccountLedger(
  accountId: string,
  query: GeneralLedgerQuery,
  userId: string,
): Promise<GeneralLedgerResponse> {
  const companyId = await getCompanyIdForUser(userId);

  // 1. Fetch target account
  const account = await prisma.account.findFirst({
    where: { id: accountId, companyId },
  });
  if (!account) {
    throw new NotFoundError(`Ledger account with ID "${accountId}" not found`);
  }

  // 2. Compute starting balance prior to dateFrom
  let startingBalance = Number(account.openingBalance);
  if (query.dateFrom) {
    const priorItems = await prisma.journalEntryItem.findMany({
      where: {
        accountId,
        journalEntry: {
          companyId,
          date: {
            lt: query.dateFrom,
          },
        },
      },
      include: {
        journalEntry: true,
      },
    });

    for (const item of priorItems) {
      const d = Number(item.debit);
      const c = Number(item.credit);
      if (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) {
        startingBalance += d - c;
      } else {
        startingBalance += c - d;
      }
    }
  }

  // 3. Fetch journal items within timeframe
  const journalEntryFilter: Prisma.JournalEntryWhereInput = { companyId };
  if (query.dateFrom || query.dateTo) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (query.dateFrom) {
      dateFilter.gte = query.dateFrom;
    }
    if (query.dateTo) {
      dateFilter.lte = query.dateTo;
    }
    journalEntryFilter.date = dateFilter;
  }

  const where: Prisma.JournalEntryItemWhereInput = {
    accountId,
    journalEntry: journalEntryFilter,
  };

  const items = await prisma.journalEntryItem.findMany({
    where,
    include: {
      journalEntry: true,
    },
    orderBy: {
      journalEntry: {
        date: 'asc',
      },
    },
  });

  // 4. Calculate running balance
  let running = startingBalance;
  const entries = items.map((item) => {
    const d = Number(item.debit);
    const c = Number(item.credit);
    if (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) {
      running += d - c;
    } else {
      running += c - d;
    }

    return {
      id: item.id,
      date: item.journalEntry.date.toISOString(),
      entryNumber: item.journalEntry.entryNumber,
      description: item.journalEntry.description,
      debit: item.debit.toString(),
      credit: item.credit.toString(),
      runningBalance: running.toFixed(4),
    };
  });

  return {
    accountId: account.id,
    accountName: account.name,
    accountCode: account.accountCode,
    accountType: account.type,
    openingBalance: startingBalance.toFixed(4),
    currentBalance: account.currentBalance.toString(),
    entries,
  };
}

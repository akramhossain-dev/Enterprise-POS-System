import { prisma } from '../../lib/prisma';
import { BadRequestError, NotFoundError } from '../../common/errors/AppError';
import { AccountType, Prisma } from '@prisma/client';
import {
  GeneralLedgerRow,
  AccountStatementReport,
  TrialBalanceRow,
  FinancialSummaryReport,
} from './report.types';

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new BadRequestError('User is not linked to any company/employee record');
  }
  return employee.companyId;
}

export async function getGeneralLedgerReport(
  userId: string,
  accountId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<GeneralLedgerRow[]> {
  const companyId = await getCompanyIdForUser(userId);

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (account?.companyId !== companyId) {
    throw new NotFoundError(`Account with ID "${accountId}" not found`);
  }

  const isDebitNormal = account.type === AccountType.ASSET || account.type === AccountType.EXPENSE;

  // 1. Calculate Opening Balance prior to startDate
  let openingBalance = Number(account.openingBalance);
  if (startDate) {
    const priorItems = await prisma.journalEntryItem.findMany({
      where: {
        accountId,
        journalEntry: {
          companyId,
          date: { lt: startDate },
        },
      },
      select: { debit: true, credit: true },
    });

    for (const item of priorItems) {
      const db = Number(item.debit);
      const cr = Number(item.credit);
      openingBalance += isDebitNormal ? db - cr : cr - db;
    }
  }

  // 2. Fetch ledger items in date range
  const dateFilter: Prisma.DateTimeFilter = {};
  if (startDate) {
    dateFilter.gte = startDate;
  }
  if (endDate) {
    dateFilter.lte = endDate;
  }

  const items = await prisma.journalEntryItem.findMany({
    where: {
      accountId,
      journalEntry: {
        companyId,
        ...(startDate || endDate ? { date: dateFilter } : {}),
      },
    },
    include: {
      journalEntry: true,
    },
    orderBy: {
      journalEntry: { date: 'asc' },
    },
  });

  const rows: GeneralLedgerRow[] = [];
  let runningBalance = openingBalance;

  for (const item of items) {
    const db = Number(item.debit);
    const cr = Number(item.credit);
    runningBalance += isDebitNormal ? db - cr : cr - db;

    rows.push({
      date: item.journalEntry.date.toISOString(),
      reference: item.journalEntry.entryNumber,
      debit: db.toFixed(2),
      credit: cr.toFixed(2),
      balance: runningBalance.toFixed(2),
    });
  }

  return rows;
}

export async function getAccountStatementReport(
  userId: string,
  accountId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<AccountStatementReport> {
  const companyId = await getCompanyIdForUser(userId);

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (account?.companyId !== companyId) {
    throw new NotFoundError(`Account with ID "${accountId}" not found`);
  }

  const isDebitNormal = account.type === AccountType.ASSET || account.type === AccountType.EXPENSE;

  // Calculate Opening Balance prior to startDate
  let openingBalance = Number(account.openingBalance);
  if (startDate) {
    const priorItems = await prisma.journalEntryItem.findMany({
      where: {
        accountId,
        journalEntry: {
          companyId,
          date: { lt: startDate },
        },
      },
      select: { debit: true, credit: true },
    });

    for (const item of priorItems) {
      const db = Number(item.debit);
      const cr = Number(item.credit);
      openingBalance += isDebitNormal ? db - cr : cr - db;
    }
  }

  const transactions = await getGeneralLedgerReport(userId, accountId, startDate, endDate);

  const lastTx = transactions[transactions.length - 1];
  const closingBalance = lastTx ? lastTx.balance : openingBalance.toFixed(2);

  return {
    accountId: account.id,
    accountName: account.name,
    accountCode: account.accountCode,
    openingBalance: openingBalance.toFixed(2),
    transactions,
    closingBalance,
  };
}

export async function getTrialBalanceReport(userId: string): Promise<TrialBalanceRow[]> {
  const companyId = await getCompanyIdForUser(userId);

  const accounts = await prisma.account.findMany({
    where: { companyId },
    orderBy: { accountCode: 'asc' },
  });

  const rows: TrialBalanceRow[] = [];

  for (const account of accounts) {
    const summary = await prisma.journalEntryItem.aggregate({
      where: {
        accountId: account.id,
        journalEntry: { companyId },
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    rows.push({
      accountId: account.id,
      accountCode: account.accountCode,
      accountName: account.name,
      type: account.type,
      debitTotal: (
        Number(summary._sum.debit ?? 0) +
        (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE
          ? Number(account.openingBalance)
          : 0)
      ).toFixed(2),
      creditTotal: (
        Number(summary._sum.credit ?? 0) +
        (account.type !== AccountType.ASSET && account.type !== AccountType.EXPENSE
          ? Number(account.openingBalance)
          : 0)
      ).toFixed(2),
    });
  }

  return rows;
}

export async function getFinancialSummaryReport(
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<FinancialSummaryReport> {
  const companyId = await getCompanyIdForUser(userId);

  // If date ranges are provided, filter journal entries. Otherwise aggregate full current balances.
  let totalIncome = 0;
  let totalExpense = 0;

  if (startDate || endDate) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) {
      dateFilter.gte = startDate;
    }
    if (endDate) {
      dateFilter.lte = endDate;
    }

    const incomeAccounts = await prisma.account.findMany({
      where: { companyId, type: AccountType.INCOME },
    });
    const expenseAccounts = await prisma.account.findMany({
      where: { companyId, type: AccountType.EXPENSE },
    });

    for (const acc of incomeAccounts) {
      const sum = await prisma.journalEntryItem.aggregate({
        where: {
          accountId: acc.id,
          journalEntry: { companyId, date: dateFilter },
        },
        _sum: { debit: true, credit: true },
      });
      // Income is credit normal
      const db = Number(sum._sum.debit ?? 0);
      const cr = Number(sum._sum.credit ?? 0);
      totalIncome += cr - db;
    }

    for (const acc of expenseAccounts) {
      const sum = await prisma.journalEntryItem.aggregate({
        where: {
          accountId: acc.id,
          journalEntry: { companyId, date: dateFilter },
        },
        _sum: { debit: true, credit: true },
      });
      // Expense is debit normal
      const db = Number(sum._sum.debit ?? 0);
      const cr = Number(sum._sum.credit ?? 0);
      totalExpense += db - cr;
    }
  } else {
    // Rely on pre-aggregated Account.currentBalance
    const incomeSum = await prisma.account.aggregate({
      where: { companyId, type: AccountType.INCOME },
      _sum: { currentBalance: true },
    });

    const expenseSum = await prisma.account.aggregate({
      where: { companyId, type: AccountType.EXPENSE },
      _sum: { currentBalance: true },
    });

    totalIncome = Number(incomeSum._sum.currentBalance ?? 0);
    totalExpense = Number(expenseSum._sum.currentBalance ?? 0);
  }

  const netProfit = totalIncome - totalExpense;

  return {
    totalIncome: totalIncome.toFixed(2),
    totalExpense: totalExpense.toFixed(2),
    netProfit: netProfit.toFixed(2),
  };
}

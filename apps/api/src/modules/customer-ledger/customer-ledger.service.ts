import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import {
  CustomerLedgerQuery,
  MappedCustomerLedgerEntry,
  CustomerBalanceResponse,
} from './customer-ledger.types';

export function mapLedgerEntry(
  entry: Prisma.CustomerLedgerEntryGetPayload<Record<string, never>>,
): MappedCustomerLedgerEntry {
  return {
    id: entry.id,
    companyId: entry.companyId,
    customerId: entry.customerId,
    entryType: entry.entryType,
    amount: entry.amount.toString(),
    runningBalance: entry.runningBalance.toString(),
    referenceId: entry.referenceId,
    referenceNo: entry.referenceNo,
    description: entry.description,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function recordLedgerEntry(
  tx: Prisma.TransactionClient,
  data: {
    companyId: string;
    customerId: string;
    entryType: import('@prisma/client').CustomerLedgerEntryType;
    amount: number | Prisma.Decimal;
    runningBalance: number | Prisma.Decimal;
    referenceId: string;
    referenceNo: string;
    description?: string;
  },
) {
  return tx.customerLedgerEntry.create({
    data: {
      companyId: data.companyId,
      customerId: data.customerId,
      entryType: data.entryType,
      amount: new Prisma.Decimal(data.amount),
      runningBalance: new Prisma.Decimal(data.runningBalance),
      referenceId: data.referenceId,
      referenceNo: data.referenceNo,
      description: data.description ?? null,
    },
  });
}

export async function getCustomerLedger(
  customerId: string,
  companyId: string,
  query: CustomerLedgerQuery,
): Promise<{
  entries: MappedCustomerLedgerEntry[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, companyId },
  });
  if (!customer) {
    throw new NotFoundError(`Customer with ID "${customerId}" not found`);
  }

  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  const where: Prisma.CustomerLedgerEntryWhereInput = {
    companyId,
    customerId,
    ...(query.entryType ? { entryType: query.entryType } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          createdAt: {
            ...(query.dateFrom ? { gte: query.dateFrom } : {}),
            ...(query.dateTo ? { lte: query.dateTo } : {}),
          },
        }
      : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.customerLedgerEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.customerLedgerEntry.count({ where }),
  ]);

  return {
    entries: entries.map(mapLedgerEntry),
    meta: buildPaginationMeta(query.page ?? 1, query.limit ?? 20, total),
  };
}

export async function getCustomerBalance(
  customerId: string,
  companyId: string,
): Promise<CustomerBalanceResponse> {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, companyId },
    select: {
      id: true,
      fullName: true,
      customerCode: true,
      currentBalance: true,
      creditLimit: true,
    },
  });

  if (!customer) {
    throw new NotFoundError(`Customer with ID "${customerId}" not found`);
  }

  return {
    customerId: customer.id,
    fullName: customer.fullName,
    customerCode: customer.customerCode,
    currentBalance: customer.currentBalance.toString(),
    creditLimit: customer.creditLimit.toString(),
  };
}

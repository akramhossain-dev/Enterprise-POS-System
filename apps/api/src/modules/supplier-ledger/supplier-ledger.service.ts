import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import {
  SupplierLedgerQuery,
  MappedSupplierLedgerEntry,
  SupplierBalanceResponse,
} from './supplier-ledger.types';

export function mapLedgerEntry(
  entry: Prisma.SupplierLedgerEntryGetPayload<Record<string, never>>,
): MappedSupplierLedgerEntry {
  return {
    id: entry.id,
    companyId: entry.companyId,
    supplierId: entry.supplierId,
    entryType: entry.entryType,
    amount: entry.amount.toString(),
    runningBalance: entry.runningBalance.toString(),
    referenceId: entry.referenceId,
    referenceNo: entry.referenceNo,
    description: entry.description,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function getSupplierLedger(
  supplierId: string,
  query: SupplierLedgerQuery,
): Promise<{
  entries: MappedSupplierLedgerEntry[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
  });
  if (!supplier) {
    throw new NotFoundError(`Supplier "${supplierId}" not found`);
  }

  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  const where = {
    supplierId,
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

  const [entries, total] = await prisma.$transaction([
    prisma.supplierLedgerEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.supplierLedgerEntry.count({ where }),
  ]);

  return {
    entries: entries.map(mapLedgerEntry),
    meta: buildPaginationMeta(query.page ?? 1, query.limit ?? 20, total),
  };
}

export async function getSupplierBalance(supplierId: string): Promise<SupplierBalanceResponse> {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: {
      id: true,
      companyName: true,
      supplierCode: true,
      currentBalance: true,
      creditLimit: true,
    },
  });

  if (!supplier) {
    throw new NotFoundError(`Supplier "${supplierId}" not found`);
  }

  return {
    supplierId: supplier.id,
    companyName: supplier.companyName,
    supplierCode: supplier.supplierCode,
    currentBalance: supplier.currentBalance.toString(),
    creditLimit: supplier.creditLimit.toString(),
  };
}

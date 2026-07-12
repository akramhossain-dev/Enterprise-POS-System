import { Prisma, PaymentMethod } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { SupplierPaymentQuery, CreateSupplierPaymentBody } from './supplier-payment.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';

export interface MappedSupplierPayment {
  id: string;
  companyId: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  paymentNumber: string;
  paymentDate: string;
  amount: string;
  paymentMethod: PaymentMethod;
  reference: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
}

const SELECT = {
  id: true,
  companyId: true,
  supplierId: true,
  paymentNumber: true,
  paymentDate: true,
  amount: true,
  paymentMethod: true,
  reference: true,
  notes: true,
  createdBy: true,
  createdAt: true,
  supplier: { select: { id: true, companyName: true, supplierCode: true } },
} satisfies Prisma.SupplierPaymentSelect;

type DbSupplierPayment = Prisma.SupplierPaymentGetPayload<{
  select: typeof SELECT;
}>;

export function mapSupplierPayment(sp: DbSupplierPayment): MappedSupplierPayment {
  return {
    id: sp.id,
    companyId: sp.companyId,
    supplierId: sp.supplierId,
    supplierName: sp.supplier.companyName,
    supplierCode: sp.supplier.supplierCode,
    paymentNumber: sp.paymentNumber,
    paymentDate: sp.paymentDate.toISOString(),
    amount: sp.amount.toString(),
    paymentMethod: sp.paymentMethod,
    reference: sp.reference,
    notes: sp.notes,
    createdBy: sp.createdBy,
    createdAt: sp.createdAt.toISOString(),
  };
}

export async function findSupplierPayments(query: SupplierPaymentQuery): Promise<{
  payments: MappedSupplierPayment[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  const searchFilter: Prisma.SupplierPaymentWhereInput = query.search
    ? {
        OR: [
          { paymentNumber: { contains: query.search, mode: 'insensitive' as const } },
          { supplier: { companyName: { contains: query.search, mode: 'insensitive' as const } } },
          { reference: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const where: Prisma.SupplierPaymentWhereInput = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.supplierId ? { supplierId: query.supplierId } : {}),
    ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
    ...(query.paymentNumber
      ? { paymentNumber: { contains: query.paymentNumber, mode: 'insensitive' as const } }
      : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          paymentDate: {
            ...(query.dateFrom ? { gte: query.dateFrom } : {}),
            ...(query.dateTo ? { lte: query.dateTo } : {}),
          },
        }
      : {}),
    ...searchFilter,
  };

  const [payments, total] = await prisma.$transaction([
    prisma.supplierPayment.findMany({
      where,
      select: SELECT,
      orderBy: { paymentDate: query.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.supplierPayment.count({ where }),
  ]);

  return {
    payments: payments.map(mapSupplierPayment),
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function findSupplierPaymentById(id: string): Promise<MappedSupplierPayment | null> {
  const sp = await prisma.supplierPayment.findUnique({
    where: { id },
    select: SELECT,
  });
  if (!sp) {
    return null;
  }
  return mapSupplierPayment(sp);
}

export async function generateNextSupplierPaymentNumber(
  companyId: string,
  tx: Prisma.TransactionClient,
): Promise<string> {
  const count = await tx.supplierPayment.count({
    where: { companyId },
  });
  return `SP-${String(count + 1).padStart(6, '0')}`;
}

export async function insertSupplierPayment(
  data: CreateSupplierPaymentBody & { paymentNumber: string; createdBy: string },
  tx: Prisma.TransactionClient,
): Promise<MappedSupplierPayment> {
  const created = await tx.supplierPayment.create({
    data: {
      companyId: data.companyId,
      supplierId: data.supplierId,
      paymentNumber: data.paymentNumber,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      reference: data.reference ?? null,
      notes: data.notes ?? null,
      createdBy: data.createdBy,
    },
    select: SELECT,
  });

  return mapSupplierPayment(created);
}

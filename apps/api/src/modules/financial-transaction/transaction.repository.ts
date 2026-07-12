import { prisma } from '../../lib/prisma';
import { Prisma, PaymentReceipt, PaymentVoucher } from '@prisma/client';
import {
  MappedPaymentReceipt,
  MappedPaymentVoucher,
  PaymentReceiptQuery,
  PaymentVoucherQuery,
} from './transaction.types';
import { buildPaginationMeta, paginate } from '../../common/utils/query';

type PrismaReceiptWithRelations = PaymentReceipt & {
  customer: { id: string; firstName: string; lastName: string } | null;
  supplier: { id: string; companyName: string } | null;
  account: { id: string; accountCode: string; name: string };
  creator: { id: string; name: string };
};

type PrismaVoucherWithRelations = PaymentVoucher & {
  account: { id: string; accountCode: string; name: string };
  creator: { id: string; name: string };
};

// ── Mappings ────────────────────────────────────────────────────────────────
export function mapPaymentReceipt(rct: PrismaReceiptWithRelations): MappedPaymentReceipt {
  return {
    id: rct.id,
    receiptNumber: rct.receiptNumber,
    type: rct.type,
    amount: rct.amount.toString(),
    paymentMethod: rct.paymentMethod,
    reference: rct.reference,
    description: rct.description,
    date: rct.date.toISOString(),
    customer: rct.customer
      ? { id: rct.customer.id, name: `${rct.customer.firstName} ${rct.customer.lastName}`.trim() }
      : null,
    supplier: rct.supplier ? { id: rct.supplier.id, name: rct.supplier.companyName } : null,
    account: {
      id: rct.account.id,
      accountCode: rct.account.accountCode,
      name: rct.account.name,
    },
    creator: {
      id: rct.creator.id,
      name: rct.creator.name,
    },
    createdAt: rct.createdAt.toISOString(),
  };
}

export function mapPaymentVoucher(vch: PrismaVoucherWithRelations): MappedPaymentVoucher {
  return {
    id: vch.id,
    voucherNumber: vch.voucherNumber,
    type: vch.type,
    amount: vch.amount.toString(),
    paymentMethod: vch.paymentMethod,
    description: vch.description,
    date: vch.date.toISOString(),
    account: {
      id: vch.account.id,
      accountCode: vch.account.accountCode,
      name: vch.account.name,
    },
    creator: {
      id: vch.creator.id,
      name: vch.creator.name,
    },
    createdAt: vch.createdAt.toISOString(),
  };
}

// ── Receipt Generators & Lookups ────────────────────────────────────────────
export async function generateReceiptNumber(
  companyId: string,
  tx: Prisma.TransactionClient,
): Promise<string> {
  const count = await tx.paymentReceipt.count({
    where: { companyId },
  });
  const seq = String(count + 1).padStart(6, '0');
  return `RCT-${seq}`;
}

export async function findReceiptById(
  id: string,
  tx?: Prisma.TransactionClient,
): Promise<PrismaReceiptWithRelations | null> {
  const client = tx ?? prisma;
  return client.paymentReceipt.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      supplier: { select: { id: true, companyName: true } },
      account: { select: { id: true, accountCode: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  });
}

export async function findReceipts(
  companyId: string,
  query: PaymentReceiptQuery,
): Promise<{
  receipts: PrismaReceiptWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const { skip, take } = paginate({ page, limit });

  const where: Prisma.PaymentReceiptWhereInput = {
    companyId,
    ...(query.type ? { type: query.type } : {}),
    ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          date: {
            ...(query.dateFrom ? { gte: query.dateFrom } : {}),
            ...(query.dateTo ? { lte: query.dateTo } : {}),
          },
        }
      : {}),
    ...(query.search
      ? {
          OR: [
            { receiptNumber: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { reference: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [receipts, total] = await Promise.all([
    prisma.paymentReceipt.findMany({
      where,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        supplier: { select: { id: true, companyName: true } },
        account: { select: { id: true, accountCode: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      skip,
      take,
    }),
    prisma.paymentReceipt.count({ where }),
  ]);

  return {
    receipts,
    meta: buildPaginationMeta(page, limit, total),
  };
}

// ── Voucher Generators & Lookups ────────────────────────────────────────────
export async function generateVoucherNumber(
  companyId: string,
  tx: Prisma.TransactionClient,
): Promise<string> {
  const count = await tx.paymentVoucher.count({
    where: { companyId },
  });
  const seq = String(count + 1).padStart(6, '0');
  return `VCH-${seq}`;
}

export async function findVoucherById(
  id: string,
  tx?: Prisma.TransactionClient,
): Promise<PrismaVoucherWithRelations | null> {
  const client = tx ?? prisma;
  return client.paymentVoucher.findUnique({
    where: { id },
    include: {
      account: { select: { id: true, accountCode: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  });
}

export async function findVouchers(
  companyId: string,
  query: PaymentVoucherQuery,
): Promise<{
  vouchers: PrismaVoucherWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const { skip, take } = paginate({ page, limit });

  const where: Prisma.PaymentVoucherWhereInput = {
    companyId,
    ...(query.type ? { type: query.type } : {}),
    ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          date: {
            ...(query.dateFrom ? { gte: query.dateFrom } : {}),
            ...(query.dateTo ? { lte: query.dateTo } : {}),
          },
        }
      : {}),
    ...(query.search
      ? {
          OR: [
            { voucherNumber: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [vouchers, total] = await Promise.all([
    prisma.paymentVoucher.findMany({
      where,
      include: {
        account: { select: { id: true, accountCode: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      skip,
      take,
    }),
    prisma.paymentVoucher.count({ where }),
  ]);

  return {
    vouchers,
    meta: buildPaginationMeta(page, limit, total),
  };
}

import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { SaleQuery } from './sales.schema';
import { PrismaSaleWithRelations } from './sales.mapper';
import { paginate, buildPaginationMeta } from '../../common/utils/query';

const SELECT_RELATIONS = {
  customer: { select: { id: true, fullName: true, customerCode: true } },
  items: {
    include: {
      product: { select: { name: true, sku: true, barcode: true } },
    },
  },
} satisfies Prisma.SaleInclude;

export async function findSaleById(
  id: string,
  tx?: Prisma.TransactionClient,
): Promise<PrismaSaleWithRelations | null> {
  const client = tx ?? prisma;
  return client.sale.findUnique({
    where: { id },
    include: SELECT_RELATIONS,
  });
}

export async function generateNextInvoiceNumber(
  companyId: string,
  tx: Prisma.TransactionClient,
): Promise<string> {
  const count = await tx.sale.count({
    where: { companyId },
  });
  const seq = String(count + 1).padStart(6, '0');
  return `INV-${seq}`;
}

export async function findSales(
  companyId: string,
  query: SaleQuery,
): Promise<{
  sales: PrismaSaleWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  const where: Prisma.SaleWhereInput = {
    companyId,
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
  };

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: SELECT_RELATIONS,
      orderBy: { saleDate: query.sortOrder },
      skip,
      take,
    }),
    prisma.sale.count({ where }),
  ]);

  return {
    sales,
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function incrementInvoicePrintCount(
  saleId: string,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const client = tx ?? prisma;
  const invoice = await client.invoice.findUnique({
    where: { saleId },
  });
  if (!invoice) {
    throw new Error(`Invoice for sale "${saleId}" not found`);
  }

  await client.invoice.update({
    where: { id: invoice.id },
    data: {
      printCount: {
        increment: 1,
      },
    },
  });
}

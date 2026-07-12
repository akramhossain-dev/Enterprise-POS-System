import { prisma } from '../../lib/prisma';
import { Prisma, Invoice } from '@prisma/client';

export async function findInvoiceBySaleId(
  saleId: string,
  tx?: Prisma.TransactionClient,
): Promise<Invoice | null> {
  const client = tx ?? prisma;
  return client.invoice.findUnique({
    where: { saleId },
  });
}

export async function updateInvoicePrintCount(
  id: string,
  tx?: Prisma.TransactionClient,
): Promise<Invoice> {
  const client = tx ?? prisma;
  return client.invoice.update({
    where: { id },
    data: {
      printCount: {
        increment: 1,
      },
    },
  });
}

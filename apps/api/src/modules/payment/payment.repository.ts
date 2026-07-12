import { prisma } from '../../lib/prisma';
import { Prisma, Payment } from '@prisma/client';
import { CreatePaymentBody } from './payment.schema';

export async function findPaymentsBySaleId(saleId: string): Promise<Payment[]> {
  return prisma.payment.findMany({
    where: { saleId },
    orderBy: { paidAt: 'desc' },
  });
}

export async function createPayment(
  data: CreatePaymentBody & { createdBy: string },
  tx?: Prisma.TransactionClient,
): Promise<Payment> {
  const client = tx ?? prisma;
  return client.payment.create({
    data: {
      saleId: data.saleId,
      paymentMethod: data.paymentMethod,
      amount: new Prisma.Decimal(data.amount),
      reference: data.reference ?? null,
      transactionId: data.transactionId ?? null,
      createdBy: data.createdBy,
    },
  });
}

import { prisma } from '../../lib/prisma';
import { Prisma, Refund } from '@prisma/client';

export async function findRefundById(
  id: string,
  tx?: Prisma.TransactionClient,
): Promise<Refund | null> {
  const client = tx ?? prisma;
  return client.refund.findUnique({
    where: { id },
  });
}

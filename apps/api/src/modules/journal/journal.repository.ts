import { prisma } from '../../lib/prisma';
import { Prisma, JournalEntry } from '@prisma/client';

export async function findJournalEntryById(
  id: string,
  tx?: Prisma.TransactionClient,
): Promise<JournalEntry | null> {
  const client = tx ?? prisma;
  return client.journalEntry.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          account: { select: { name: true, accountCode: true } },
        },
      },
    },
  });
}

export async function generateEntryNumber(
  companyId: string,
  tx: Prisma.TransactionClient,
): Promise<string> {
  const count = await tx.journalEntry.count({
    where: { companyId },
  });
  const seq = String(count + 1).padStart(6, '0');
  return `JE-${seq}`;
}

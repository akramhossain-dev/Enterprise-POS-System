import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { createLogger } from './logger';

const log = createLogger('transaction');

/**
 * Execute a callback within a type-safe database transaction.
 *
 * @param callback - Execution function receiving the transactional client context.
 * @param options - Prisma transaction option overrides (timeout, isolation level).
 * @returns The resolved value of the callback.
 */
export async function runInTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => {
      return await callback(tx);
    }, options);
  } catch (error) {
    log.error({ error }, 'Database transaction failed and rolled back');
    throw error;
  }
}

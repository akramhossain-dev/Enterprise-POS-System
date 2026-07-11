import { PrismaClient } from '@prisma/client';
import { createLogger } from './logger';

const log = createLogger('database');

// ─────────────────────────────────────────────
// Prisma Client Singleton
// ─────────────────────────────────────────────
// Prevents multiple instances in development due to hot-reloading.

declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
      { level: 'error', emit: 'stdout' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Log slow queries in development
if (process.env.NODE_ENV === 'development') {
  // @ts-expect-error Prisma event typing
  prisma.$on('query', (event: { query: string; duration: number }) => {
    if (event.duration > 100) {
      log.warn(
        { query: event.query, duration: `${String(event.duration)}ms` },
        'Slow query detected',
      );
    }
  });
}

/**
 * Connect to the database.
 * Call this on application startup.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    log.info('Database connected successfully');
  } catch (error) {
    log.error({ error }, 'Failed to connect to database');
    throw error;
  }
}

/**
 * Disconnect from the database.
 * Call this on graceful shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    log.info('Database disconnected');
  } catch (error) {
    log.error({ error }, 'Error disconnecting from database');
    throw error;
  }
}

export { prisma };
export default prisma;

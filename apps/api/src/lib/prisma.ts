import { PrismaClient } from '@prisma/client';
import { env, isDev } from '../config';

// ─────────────────────────────────────────────
// Reusable Prisma Client Singleton
// ─────────────────────────────────────────────
// Prevents multiple instances in development due to hot-reloading.

declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { level: 'query', emit: 'event' },
            { level: 'info', emit: 'stdout' },
            { level: 'warn', emit: 'stdout' },
            { level: 'error', emit: 'stdout' },
          ]
        : [{ level: 'error', emit: 'stdout' }],
  });

if (isDev) {
  globalThis.__prisma = prisma;
}

export { prisma };
export default prisma;

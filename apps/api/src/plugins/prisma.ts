import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { connectDatabase, disconnectDatabase, prisma } from '../lib/database';
import { createLogger } from '../lib/logger';

const log = createLogger('prisma-plugin');

// ─────────────────────────────────────────────
// Fastify type augmentation
// ─────────────────────────────────────────────

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

// ─────────────────────────────────────────────
// Prisma Plugin
// ─────────────────────────────────────────────

export default fp(
  async (fastify: FastifyInstance) => {
    // Connect to the database
    await connectDatabase();

    // Decorate the Fastify instance
    fastify.decorate('prisma', prisma);

    // Graceful shutdown
    fastify.addHook('onClose', async () => {
      log.info('Closing Prisma connection...');
      await disconnectDatabase();
    });
  },
  {
    name: 'prisma-plugin',
  },
);

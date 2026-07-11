import Fastify, { FastifyInstance } from 'fastify';
import { isDev } from './config';
import { createLogger } from './lib/logger';
import { errorHandler } from './common/errors/errorHandler';
import { API_PREFIX } from './common/constants';

// Plugins
import fastifyCookie from '@fastify/cookie';
import corsPlugin from './plugins/cors';
import helmetPlugin from './plugins/helmet';
import swaggerPlugin from './plugins/swagger';
import rateLimitPlugin from './plugins/rate-limit';
import prismaPlugin from './plugins/prisma';
import redisPlugin from './plugins/redis';

// Routes
import { routes } from './routes';

const log = createLogger('app');

// ─────────────────────────────────────────────
// Build Fastify Application
// ─────────────────────────────────────────────

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: isDev
      ? {
          level: 'debug',
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
              ignore: 'pid,hostname',
            },
          },
        }
      : { level: 'info' },
    trustProxy: true, // Trust X-Forwarded-For from Nginx
    genReqId: () => crypto.randomUUID(),
  });

  // ── Security plugins (register first) ──────
  await fastify.register(helmetPlugin);
  await fastify.register(corsPlugin);
  await fastify.register(rateLimitPlugin);
  await fastify.register(fastifyCookie);

  // ── Documentation ──────────────────────────
  await fastify.register(swaggerPlugin);

  // ── Data layer plugins ─────────────────────
  await fastify.register(prismaPlugin);
  await fastify.register(redisPlugin);

  // ── Global error handler ───────────────────
  fastify.setErrorHandler(errorHandler);

  // ── 404 handler ───────────────────────────
  fastify.setNotFoundHandler((request, reply) => {
    log.warn({ url: request.url, method: request.method }, 'Route not found');
    reply.status(404).send({
      success: false,
      message: `Route ${request.method} ${request.url} not found`,
      errors: [],
      statusCode: 404,
    });
  });

  // ── Routes ─────────────────────────────────
  await fastify.register(routes, { prefix: API_PREFIX });

  return fastify;
}

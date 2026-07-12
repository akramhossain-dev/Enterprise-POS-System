import Fastify, { FastifyInstance } from 'fastify';
import { isDev } from './config';
import { createLogger } from './lib/logger';
import { errorHandler } from './common/errors/errorHandler';
import { API_PREFIX } from './common/constants';
import crypto from 'crypto';

// Plugins
import fastifyCookie from '@fastify/cookie';
import corsPlugin from './plugins/cors';
import helmetPlugin from './plugins/helmet';
import swaggerPlugin from './plugins/swagger';
import rateLimitPlugin from './plugins/rate-limit';
import prismaPlugin from './plugins/prisma';
import redisPlugin from './plugins/redis';
import fastifyCompress from '@fastify/compress';
import fastifyEtag from '@fastify/etag';

import { routes } from './routes';
import { initScheduler } from './jobs/scheduler';
import { sanitizeInput } from './common/utils/security';

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

  // ── Performance optimization plugins ───────
  await fastify.register(fastifyCompress);
  await fastify.register(fastifyEtag);

  // ── Documentation ──────────────────────────
  await fastify.register(swaggerPlugin);

  // ── Data layer plugins ─────────────────────
  await fastify.register(prismaPlugin);
  await fastify.register(redisPlugin);

  // ── WebSocket ──────────────────────────────
  const { default: fastifySocketIO } = await import('fastify-socket.io');
  await fastify.register(fastifySocketIO, {
    cors: {
      origin: '*',
    },
  });

  const { initSocketServer } = await import('./modules/notification/socket');
  initSocketServer(fastify);

  // ── Input Sanitization preValidation Hook ───
  fastify.addHook('preValidation', (request, reply, done) => {
    if (request.body) {
      request.body = sanitizeInput(request.body);
    }
    done();
  });

  // ── Structured Logging Hooks ───────────────
  fastify.addHook('onRequest', (request, reply, done) => {
    request.headers['x-start-time'] = String(performance.now());
    done();
  });

  fastify.addHook('onResponse', (request, reply, done) => {
    const startTimeStr = request.headers['x-start-time'];
    const duration = startTimeStr ? performance.now() - Number(startTimeStr) : 0;
    const user = request.user as { id?: string } | null | undefined;
    const userId = user?.id ?? 'anonymous';

    request.log.info(
      {
        requestId: request.id,
        userId,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        executionTimeMs: Number(duration.toFixed(2)),
      },
      'Request completed',
    );

    done();
  });

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

  // ── Initialize background jobs scheduler ────
  fastify.ready((err) => {
    if (!err) {
      void initScheduler();
    }
  });

  return fastify;
}

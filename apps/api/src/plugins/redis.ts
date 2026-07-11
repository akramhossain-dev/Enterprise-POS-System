import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { env } from '../config';
import { createLogger } from '../lib/logger';

const log = createLogger('redis-plugin');

// ─────────────────────────────────────────────
// Fastify type augmentation
// ─────────────────────────────────────────────

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

// ─────────────────────────────────────────────
// Redis Plugin
// ─────────────────────────────────────────────

export default fp(
  async (fastify: FastifyInstance) => {
    await Promise.resolve();
    const redis = new Redis(env.REDIS_URL, {
      // Retry strategy: exponential backoff up to 30 seconds
      retryStrategy: (times: number) => {
        if (times > 10) {
          log.error('Redis: maximum retry attempts reached');
          return null; // Stop retrying
        }
        const delay = Math.min(times * 200, 30000);
        log.warn({ attempt: times, delayMs: delay }, 'Redis: retrying connection...');
        return delay;
      },
      // Connection options
      connectTimeout: 10000,
      commandTimeout: 5000,
      lazyConnect: false,
      enableOfflineQueue: true,
      maxRetriesPerRequest: 3,
    });

    // Event handlers
    redis.on('connect', () => {
      log.info('Redis connected successfully');
    });

    redis.on('ready', () => {
      log.info('Redis is ready to accept commands');
    });

    redis.on('error', (error: Error) => {
      log.error({ error: error.message }, 'Redis error');
    });

    redis.on('close', () => {
      log.warn('Redis connection closed');
    });

    redis.on('reconnecting', () => {
      log.info('Redis reconnecting...');
    });

    // Decorate the Fastify instance
    fastify.decorate('redis', redis);

    // Graceful shutdown
    fastify.addHook('onClose', async () => {
      log.info('Closing Redis connection...');
      await redis.quit();
      log.info('Redis disconnected');
    });
  },
  {
    name: 'redis-plugin',
  },
);

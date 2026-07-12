import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import { env } from '../config';
import { redisConnection } from '../modules/notification/queue';

// ─────────────────────────────────────────────
// Rate Limit Plugin (Redis Backend)
// ─────────────────────────────────────────────

export default fp(
  async (fastify: FastifyInstance) => {
    await fastify.register(rateLimit, {
      global: true,
      max: env.NODE_ENV === 'production' ? 100 : 1000,
      timeWindow: '1 minute',
      redis: redisConnection,
      errorResponseBuilder: (_request, context) => ({
        success: false,
        message: 'Too many requests — please slow down',
        errors: [],
        statusCode: 429,
        retryAfter: context.after,
      }),
      // Skip rate limiting for health check and docs
      skipOnError: false,
      allowList: [],
      keyGenerator: (request) => {
        // Use X-Forwarded-For if behind a proxy (Nginx), else direct IP
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
          return Array.isArray(forwarded)
            ? (forwarded[0] ?? request.ip)
            : (forwarded.split(',')[0] ?? request.ip);
        }
        return request.ip;
      },
    });
  },
  {
    name: 'rate-limit-plugin',
  },
);

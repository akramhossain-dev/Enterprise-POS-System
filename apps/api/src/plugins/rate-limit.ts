import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import { env } from '../config';
import { redisConnection } from '../modules/notification/queue';

// ─────────────────────────────────────────────
// Rate Limit Plugin (Redis Backend)
// ─────────────────────────────────────────────

// Routes excluded from rate limiting:
// Health checks must always be reachable (Docker, load balancers, uptime monitors)
const RATE_LIMIT_ALLOWLIST = ['/api/v1/live', '/api/v1/ready'];

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
      skipOnError: false,
      allowList: (request) => {
        // Skip rate limiting for health check endpoints
        return RATE_LIMIT_ALLOWLIST.includes(request.url);
      },
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

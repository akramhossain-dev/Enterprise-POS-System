import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';
import { env } from '../config';

// ─────────────────────────────────────────────
// CORS Plugin
// ─────────────────────────────────────────────

export default fp(
  async (fastify: FastifyInstance) => {
    await fastify.register(cors, {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) {
          callback(null, true);
          return;
        }

        const allowedOrigins = [
          env.FRONTEND_URL,
          // Allow localhost variants in development
          ...(env.NODE_ENV === 'development'
            ? ['http://localhost:3000', 'http://127.0.0.1:3000']
            : []),
        ];

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      maxAge: 86400, // 24 hours preflight cache
    });
  },
  {
    name: 'cors-plugin',
  },
);

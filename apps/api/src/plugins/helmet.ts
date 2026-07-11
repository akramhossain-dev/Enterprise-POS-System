import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';
import { FastifyInstance } from 'fastify';

// ─────────────────────────────────────────────
// Helmet Security Headers Plugin
// ─────────────────────────────────────────────

export default fp(
  async (fastify: FastifyInstance) => {
    await fastify.register(helmet, {
      // Allow Swagger UI to load its own scripts and styles
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'cdn.jsdelivr.net', 'validator.swagger.io'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'cdn.jsdelivr.net'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false, // Required for Swagger UI
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    });
  },
  {
    name: 'helmet-plugin',
  },
);

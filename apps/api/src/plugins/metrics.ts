import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { prometheusRegistry } from '../lib/monitoring';
import { createLogger } from '../lib/logger';

import { env } from '../config/env';

const log = createLogger('metrics-plugin');

/**
 * Prometheus Metrics Plugin
 *
 * Exposes GET /metrics endpoint (admin-only in production).
 * Returns metrics in Prometheus text format for scraping.
 */
function metricsPlugin(fastify: FastifyInstance) {
  // Register /metrics route
  fastify.get(
    '/metrics',
    {
      schema: {
        hide: true, // Hide from Swagger docs
        summary: 'Prometheus metrics endpoint',
        tags: ['observability'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // In production, restrict access to internal requests or require an API key
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        const metricsKey = env.METRICS_SECRET_KEY;
        const providedKey = request.headers['x-metrics-key'] as string | undefined;

        if (!metricsKey || providedKey !== metricsKey) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }
      }

      try {
        const metrics = await prometheusRegistry.metrics();
        void reply.header('Content-Type', prometheusRegistry.contentType).send(metrics);
      } catch (err) {
        log.error({ err }, 'Failed to collect metrics');
        return reply.status(500).send({ error: 'Failed to collect metrics' });
      }
    },
  );

  log.info('Prometheus /metrics endpoint registered');
}

export default fp(metricsPlugin, {
  name: 'metrics-plugin',
  fastify: '5.x',
});

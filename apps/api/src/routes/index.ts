import { FastifyInstance } from 'fastify';
import { sendSuccess } from '../common/responses/success';

// ─────────────────────────────────────────────
// Root Routes — /api/v1
// ─────────────────────────────────────────────

export async function routes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();
  /**
   * GET /
   * Root endpoint — confirms the API is running.
   */
  fastify.get(
    '/',
    {
      schema: {
        tags: ['System'],
        summary: 'API root',
        description: 'Confirms the Enterprise POS API is running and reachable.',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      reply.status(200).send(sendSuccess({ message: 'Enterprise POS API Running' }));
    },
  );

  /**
   * GET /health
   * Health check endpoint — used by Docker, Nginx, and monitoring tools.
   */
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['System'],
        summary: 'Health check',
        description: 'Returns the current health status of the API server.',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              environment: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      reply.status(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV ?? 'unknown',
      });
    },
  );

  // ── Business Modules (Authentication & Metadata) ────
  const { authRoutes } = await import('../modules/auth/auth.routes');
  const { userRoutes } = await import('../modules/users/user.routes');
  const { roleRoutes } = await import('../modules/roles/role.routes');
  const { permissionRoutes } = await import('../modules/permissions/permission.routes');

  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(userRoutes, { prefix: '/users' });
  await fastify.register(roleRoutes, { prefix: '/roles' });
  await fastify.register(permissionRoutes, { prefix: '/permissions' });
}

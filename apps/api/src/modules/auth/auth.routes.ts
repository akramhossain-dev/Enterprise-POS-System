import { FastifyInstance } from 'fastify';
import { register, login, refresh, logout, me } from './auth.controller';
import { authGuard } from '../../common/middleware/auth';

/**
 * Routes definitions for /auth endpoints
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/register',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
    },
    register,
  );

  fastify.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
    },
    login,
  );

  fastify.post(
    '/refresh',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '15 minutes',
        },
      },
    },
    refresh,
  );

  fastify.post('/logout', logout);
  fastify.get('/me', { preHandler: [authGuard] }, me);
}
export default authRoutes;

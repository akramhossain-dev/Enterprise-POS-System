import { FastifyInstance } from 'fastify';
import { register, login, refresh, logout, me } from './auth.controller';
import { authGuard } from '../../common/middleware/auth';

/**
 * Routes definitions for /auth endpoints
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post('/register', register);
  fastify.post('/login', login);
  fastify.post('/refresh', refresh);
  fastify.post('/logout', logout);
  fastify.get('/me', { preHandler: [authGuard] }, me);
}
export default authRoutes;

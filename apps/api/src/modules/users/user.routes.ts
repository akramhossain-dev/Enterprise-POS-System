import { FastifyInstance } from 'fastify';
import { getUsers, getUser, update, remove } from './user.controller';
import { authGuard, permissionGuard } from '../../common/middleware/auth';

/**
 * Route definitions for /users endpoints.
 * All user routes are protected by authGuard and specific permissions.
 */
export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get('/', { preHandler: [authGuard, permissionGuard('user.read')] }, getUsers);

  fastify.get('/:id', { preHandler: [authGuard, permissionGuard('user.read')] }, getUser);

  fastify.patch('/:id', { preHandler: [authGuard, permissionGuard('user.update')] }, update);

  fastify.delete('/:id', { preHandler: [authGuard, permissionGuard('user.delete')] }, remove);
}

export default userRoutes;

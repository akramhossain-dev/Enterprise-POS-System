import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { listPermissions } from './permission.service';
import { sendSuccess } from '../../common/responses/success';
import { authGuard, permissionGuard } from '../../common/middleware/auth';

/**
 * Route definitions for /permissions endpoints
 */
export async function permissionRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    { preHandler: [authGuard, permissionGuard('permission.read')] },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const permissions = await listPermissions();
      return reply.status(200).send(
        sendSuccess({
          message: 'Permissions fetched successfully',
          data: permissions,
        }),
      );
    },
  );
}

export default permissionRoutes;

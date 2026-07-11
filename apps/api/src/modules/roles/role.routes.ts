import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { listRoles } from './role.service';
import { sendSuccess } from '../../common/responses/success';
import { authGuard, permissionGuard } from '../../common/middleware/auth';

/**
 * Route definitions for /roles endpoints
 */
export async function roleRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    { preHandler: [authGuard, permissionGuard('role.read')] },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const roles = await listRoles();
      return reply.status(200).send(
        sendSuccess({
          message: 'Roles fetched successfully',
          data: roles,
        }),
      );
    },
  );
}

export default roleRoutes;

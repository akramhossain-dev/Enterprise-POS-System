import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { getUserSessionsHandler } from './session-history.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function sessionHistoryRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/user-sessions',
    {
      preHandler: guard('session.view'),
      schema: { tags: ['Sessions'], summary: 'List user active sessions' },
    },
    getUserSessionsHandler,
  );
}

import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { getLoginHistoryHandler } from './login-history.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function loginHistoryRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/login-history',
    {
      preHandler: guard('login.history.view'),
      schema: { tags: ['Login History'], summary: 'List user authentication login attempts' },
    },
    getLoginHistoryHandler,
  );
}

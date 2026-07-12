import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  getAuditLogsHandler,
  getAuditLogByIdHandler,
  getActivityLogsHandler,
} from './audit.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function auditRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/audit-logs',
    {
      preHandler: guard('audit.view'),
      schema: { tags: ['Audit'], summary: 'List all system audit logs' },
    },
    getAuditLogsHandler,
  );

  fastify.get(
    '/audit-logs/:id',
    {
      preHandler: guard('audit.view'),
      schema: { tags: ['Audit'], summary: 'Get details of a specific audit log' },
    },
    getAuditLogByIdHandler,
  );

  fastify.get(
    '/activity',
    {
      preHandler: guard('activity.view'),
      schema: { tags: ['Activity'], summary: 'List caller user activity log' },
    },
    getActivityLogsHandler,
  );
}

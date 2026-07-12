import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateQuery } from '../../common/utils/validate';
import { auditQuerySchema } from './audit.schema';
import { listAuditLogs, getAuditLogById } from './audit.service';
import { NotFoundError } from '../../common/errors/AppError';

export async function getAuditLogsHandler(req: FastifyRequest, reply: FastifyReply) {
  const query = validateQuery(auditQuerySchema, req.query) as {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    action?: string;
    entityType?: string;
    ipAddress?: string;
    search?: string;
  };
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const filters: {
    startDate?: string;
    endDate?: string;
    action?: string;
    entityType?: string;
    ipAddress?: string;
    search?: string;
  } = {};

  if (query.startDate !== undefined) {
    filters.startDate = query.startDate;
  }
  if (query.endDate !== undefined) {
    filters.endDate = query.endDate;
  }
  if (query.action !== undefined) {
    filters.action = query.action;
  }
  if (query.entityType !== undefined) {
    filters.entityType = query.entityType;
  }
  if (query.ipAddress !== undefined) {
    filters.ipAddress = query.ipAddress;
  }
  if (query.search !== undefined) {
    filters.search = query.search;
  }

  const res = await listAuditLogs(undefined, undefined, page, limit, filters);

  reply.status(200).send(
    sendSuccess({
      message: 'Audit logs fetched successfully',
      data: res.items,
      meta: {
        page,
        limit,
        total: res.total,
        totalPages: Math.ceil(res.total / limit),
      },
    }),
  );
}

export async function getAuditLogByIdHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string };

  const data = await getAuditLogById(id);
  if (!data) {
    throw new NotFoundError(`Audit log with ID "${id}" not found`);
  }

  reply.status(200).send(sendSuccess({ message: 'Audit log details fetched successfully', data }));
}

export async function getActivityLogsHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = validateQuery(auditQuerySchema, req.query) as {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    action?: string;
    entityType?: string;
    ipAddress?: string;
    search?: string;
  };
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const filters: {
    startDate?: string;
    endDate?: string;
    action?: string;
    entityType?: string;
    ipAddress?: string;
    search?: string;
  } = {};

  if (query.startDate !== undefined) {
    filters.startDate = query.startDate;
  }
  if (query.endDate !== undefined) {
    filters.endDate = query.endDate;
  }
  if (query.action !== undefined) {
    filters.action = query.action;
  }
  if (query.entityType !== undefined) {
    filters.entityType = query.entityType;
  }
  if (query.ipAddress !== undefined) {
    filters.ipAddress = query.ipAddress;
  }
  if (query.search !== undefined) {
    filters.search = query.search;
  }

  const res = await listAuditLogs(actor.id, undefined, page, limit, filters);

  reply.status(200).send(
    sendSuccess({
      message: 'Activity logs fetched successfully',
      data: res.items,
      meta: {
        page,
        limit,
        total: res.total,
        totalPages: Math.ceil(res.total / limit),
      },
    }),
  );
}

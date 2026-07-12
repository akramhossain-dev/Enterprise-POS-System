import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateQuery } from '../../common/utils/validate';
import { loginHistoryQuerySchema } from './login-history.schema';
import { listLoginHistories } from './login-history.service';

export async function getLoginHistoryHandler(req: FastifyRequest, reply: FastifyReply) {
  const query = validateQuery(loginHistoryQuerySchema, req.query) as {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    status?: string;
    ipAddress?: string;
  };
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const filters: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    status?: string;
    ipAddress?: string;
  } = {};

  if (query.startDate !== undefined) {
    filters.startDate = query.startDate;
  }
  if (query.endDate !== undefined) {
    filters.endDate = query.endDate;
  }
  if (query.userId !== undefined) {
    filters.userId = query.userId;
  }
  if (query.status !== undefined) {
    filters.status = query.status;
  }
  if (query.ipAddress !== undefined) {
    filters.ipAddress = query.ipAddress;
  }

  const res = await listLoginHistories(page, limit, filters);

  reply.status(200).send(
    sendSuccess({
      message: 'Login history fetched successfully',
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

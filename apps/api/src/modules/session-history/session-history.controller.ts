import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateQuery } from '../../common/utils/validate';
import { sessionQuerySchema } from './session-history.schema';
import { listUserSessions } from './session-history.service';

export async function getUserSessionsHandler(req: FastifyRequest, reply: FastifyReply) {
  const query = validateQuery(sessionQuerySchema, req.query) as {
    page?: number;
    limit?: number;
    userId?: string;
  };
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const filters: { userId?: string } = {};
  if (query.userId !== undefined) {
    filters.userId = query.userId;
  }

  const res = await listUserSessions(page, limit, filters);

  reply.status(200).send(
    sendSuccess({
      message: 'User sessions fetched successfully',
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

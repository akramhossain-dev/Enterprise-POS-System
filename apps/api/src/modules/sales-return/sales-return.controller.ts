import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  createSalesReturnSchema,
  salesReturnQuerySchema,
  SalesReturnQuery,
} from './sales-return.schema';
import {
  createSalesReturn,
  listSalesReturns,
  getSalesReturnDetails,
  approveSalesReturn,
  completeSalesReturn,
  cancelSalesReturn,
} from './sales-return.service';

export async function handleCreateSalesReturn(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createSalesReturnSchema, req.body);
  const actor = req.user as { id: string };

  const data = await createSalesReturn(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Sales Return draft created', data }));
}

export async function handleListSalesReturns(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(
    salesReturnQuerySchema as unknown as import('zod').ZodSchema<SalesReturnQuery>,
    req.query,
  );
  const actor = req.user as { id: string };

  const result = await listSalesReturns(actor.id, query);
  reply
    .status(200)
    .send(
      sendSuccess({ message: 'Sales Returns fetched', data: result.returns, meta: result.meta }),
    );
}

export async function handleGetSalesReturnDetails(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  const data = await getSalesReturnDetails(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Sales Return details fetched', data }));
}

export async function handleApproveSalesReturn(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  const data = await approveSalesReturn(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Sales Return approved', data }));
}

export async function handleCompleteSalesReturn(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  const data = await completeSalesReturn(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Sales Return completed', data }));
}

export async function handleCancelSalesReturn(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  const data = await cancelSalesReturn(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Sales Return cancelled', data }));
}

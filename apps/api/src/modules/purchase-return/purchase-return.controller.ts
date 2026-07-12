import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  createPurchaseReturnSchema,
  purchaseReturnQuerySchema,
  PurchaseReturnQuery,
} from './purchase-return.schema';
import {
  createPurchaseReturn,
  listPurchaseReturns,
  getPurchaseReturnById,
  approvePurchaseReturn,
  completePurchaseReturn,
  cancelPurchaseReturn,
} from './purchase-return.service';

export async function handleCreatePurchaseReturn(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createPurchaseReturnSchema, req.body);
  const actor = req.user as { id: string };
  const data = await createPurchaseReturn(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Purchase Return created', data }));
}

export async function handleListPurchaseReturns(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(
    purchaseReturnQuerySchema as unknown as import('zod').ZodSchema<PurchaseReturnQuery>,
    req.query,
  );
  const { returns, meta } = await listPurchaseReturns(query);
  reply.status(200).send(sendSuccess({ message: 'Purchase Returns fetched', data: returns, meta }));
}

export async function handleGetPurchaseReturnById(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const data = await getPurchaseReturnById(id);
  reply.status(200).send(sendSuccess({ message: 'Purchase Return fetched', data }));
}

export async function handleApprovePurchaseReturn(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const data = await approvePurchaseReturn(id);
  reply.status(200).send(sendSuccess({ message: 'Purchase Return approved', data }));
}

export async function handleCompletePurchaseReturn(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };
  const data = await completePurchaseReturn(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Purchase Return completed', data }));
}

export async function handleCancelPurchaseReturn(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const data = await cancelPurchaseReturn(id);
  reply.status(200).send(sendSuccess({ message: 'Purchase Return cancelled', data }));
}

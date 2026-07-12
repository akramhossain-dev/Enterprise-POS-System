import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  createGoodsReceiveSchema,
  goodsReceiveQuerySchema,
  GoodsReceiveQuery,
  CreateGoodsReceiveBody,
} from './goods-receive.schema';
import { createGRN, listGRNs, getGRNById, completeGRN, cancelGRN } from './goods-receive.service';

export async function handleCreateGRN(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = validateBody(createGoodsReceiveSchema, req.body);
  const actor = req.user as { id: string };
  const data = await createGRN(body as unknown as CreateGoodsReceiveBody, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Goods Receive Note created', data }));
}

export async function handleListGRNs(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = validateQuery(
    goodsReceiveQuerySchema as unknown as import('zod').ZodSchema<GoodsReceiveQuery>,
    req.query,
  );
  const { receives, meta } = await listGRNs(query);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Goods Receive Notes fetched', data: receives, meta }));
}

export async function handleGetGRNById(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const data = await getGRNById(id);
  reply.status(200).send(sendSuccess({ message: 'Goods Receive Note fetched', data }));
}

export async function handleCompleteGRN(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };
  const data = await completeGRN(id, actor.id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Goods Receive Note completed and stock updated', data }));
}

export async function handleCancelGRN(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const data = await cancelGRN(id);
  reply.status(200).send(sendSuccess({ message: 'Goods Receive Note cancelled', data }));
}

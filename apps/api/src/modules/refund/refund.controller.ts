import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody } from '../../common/utils/validate';
import { createRefundSchema } from './refund.schema';
import { recordRefund, getRefundDetails } from './refund.service';

export async function handleCreateRefund(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = validateBody(createRefundSchema, req.body);
  const actor = req.user as { id: string };

  const refund = await recordRefund(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Refund recorded successfully', data: refund }));
}

export async function handleGetRefundDetails(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  const refund = await getRefundDetails(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Refund details retrieved', data: refund }));
}

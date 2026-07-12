import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody } from '../../common/utils/validate';
import { createPaymentSchema } from './payment.schema';
import { recordAdditionalPayment, getSalePaymentsHistory } from './payment.service';

export async function handleCreatePayment(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = validateBody(createPaymentSchema, req.body);
  const actor = req.user as { id: string };

  const result = await recordAdditionalPayment(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Payment recorded successfully', data: result }));
}

export async function handleGetSalePaymentsHistory(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { saleId } = req.params as { saleId: string };
  const actor = req.user as { id: string };

  const payments = await getSalePaymentsHistory(saleId, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Payment history retrieved', data: payments }));
}

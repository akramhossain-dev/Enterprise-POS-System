import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { getInvoiceDetails, printInvoice } from './invoice.service';

export async function handleGetInvoiceDetails(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { saleId } = req.params as { saleId: string };
  const actor = req.user as { id: string };

  const invoice = await getInvoiceDetails(saleId, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Invoice details retrieved', data: invoice }));
}

export async function handlePrintInvoice(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { saleId } = req.params as { saleId: string };
  const actor = req.user as { id: string };

  const invoice = await printInvoice(saleId, actor.id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Invoice print count incremented', data: invoice }));
}

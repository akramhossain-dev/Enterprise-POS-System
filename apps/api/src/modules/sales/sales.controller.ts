import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import { checkoutSchema, saleQuerySchema, SaleQuery } from './sales.schema';
import {
  checkoutCart,
  getSaleDetails,
  getSalesList,
  getReceiptData,
  recordInvoicePrint,
} from './sales.service';

export async function handleCheckoutCart(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = validateBody(checkoutSchema, req.body);
  const actor = req.user as { id: string };

  const result = await checkoutCart(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Cart checked out successfully', data: result }));
}

export async function handleGetSaleDetails(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  const sale = await getSaleDetails(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Sale details retrieved', data: sale }));
}

export async function handleListSales(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = validateQuery(
    saleQuerySchema as unknown as import('zod').ZodSchema<SaleQuery>,
    req.query,
  );
  const actor = req.user as { id: string };

  const result = await getSalesList(actor.id, query);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Sales list retrieved', data: result.sales, meta: result.meta }));
}

export async function handleGetReceiptData(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  const data = await getReceiptData(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Receipt print data retrieved', data }));
}

export async function handleRecordInvoicePrint(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  await recordInvoicePrint(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Invoice print count incremented' }));
}

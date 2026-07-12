import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  createSupplierPaymentSchema,
  supplierPaymentQuerySchema,
  SupplierPaymentQuery,
} from './supplier-payment.schema';
import {
  createSupplierPayment,
  listSupplierPayments,
  getSupplierPaymentById,
} from './supplier-payment.service';

export async function handleCreateSupplierPayment(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createSupplierPaymentSchema, req.body);
  const actor = req.user as { id: string };
  const data = await createSupplierPayment(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Supplier Payment created', data }));
}

export async function handleListSupplierPayments(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(
    supplierPaymentQuerySchema as unknown as import('zod').ZodSchema<SupplierPaymentQuery>,
    req.query,
  );
  const { payments, meta } = await listSupplierPayments(query);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Supplier Payments fetched', data: payments, meta }));
}

export async function handleGetSupplierPaymentById(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const data = await getSupplierPaymentById(id);
  reply.status(200).send(sendSuccess({ message: 'Supplier Payment fetched', data }));
}

import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  createSupplierInvoiceSchema,
  supplierInvoiceQuerySchema,
  SupplierInvoiceQuery,
} from './supplier-invoice.schema';
import {
  createInvoice,
  listInvoices,
  getInvoiceById,
  MappedSupplierInvoice,
} from './supplier-invoice.service';

export async function handleCreateInvoice(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = validateBody(createSupplierInvoiceSchema, req.body);
  const data: MappedSupplierInvoice = await createInvoice(body);
  reply.status(201).send(sendSuccess({ message: 'Supplier Invoice created', data }));
}

export async function handleListInvoices(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = validateQuery(
    supplierInvoiceQuerySchema as unknown as import('zod').ZodSchema<SupplierInvoiceQuery>,
    req.query,
  );
  const { invoices, meta } = await listInvoices(query);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Supplier Invoices fetched', data: invoices, meta }));
}

export async function handleGetInvoiceById(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const data: MappedSupplierInvoice = await getInvoiceById(id);
  reply.status(200).send(sendSuccess({ message: 'Supplier Invoice fetched', data }));
}

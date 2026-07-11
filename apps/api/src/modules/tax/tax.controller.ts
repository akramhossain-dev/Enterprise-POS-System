import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import { taxQuerySchema, createTaxSchema, updateTaxSchema, TaxQuery } from './tax.schema';
import { listTaxes, findTaxById, createTax, updateTax, softDeleteTax } from './tax.service';

export async function handleListTaxes(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = validateQuery(taxQuerySchema, request.query) as TaxQuery;
  const result = await listTaxes(query);
  reply
    .status(200)
    .send(
      sendSuccess({ message: 'Taxes fetched successfully', data: result.taxes, meta: result.meta }),
    );
}

export async function handleGetTax(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string };
  const tax = await findTaxById(id);
  reply.status(200).send(sendSuccess({ message: 'Tax fetched successfully', data: tax }));
}

export async function handleCreateTax(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = validateBody(createTaxSchema, request.body);
  const tax = await createTax(body);
  reply.status(201).send(sendSuccess({ message: 'Tax created successfully', data: tax }));
}

export async function handleUpdateTax(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateTaxSchema, request.body);
  const tax = await updateTax(id, body);
  reply.status(200).send(sendSuccess({ message: 'Tax updated successfully', data: tax }));
}

export async function handleDeleteTax(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string };
  await softDeleteTax(id);
  reply.status(200).send(sendSuccess({ message: 'Tax deleted successfully' }));
}

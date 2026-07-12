// ─────────────────────────────────────────────
// Supplier Module — Controller
// ─────────────────────────────────────────────

import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  supplierQuerySchema,
  createSupplierSchema,
  updateSupplierSchema,
  createAddressSchema,
  SupplierQuery,
  CreateSupplierBody,
  CreateAddressBody,
} from './supplier.schema';
import {
  listSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  addAddress,
  listSupplierAddresses,
} from './supplier.service';

export async function handleListSuppliers(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(supplierQuerySchema, request.query) as SupplierQuery;
  const { suppliers, meta } = await listSuppliers(query);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Suppliers fetched successfully', data: suppliers, meta }));
}

export async function handleGetSupplier(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const supplier = await getSupplierById(id);
  reply.status(200).send(sendSuccess({ message: 'Supplier fetched successfully', data: supplier }));
}

export async function handleCreateSupplier(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createSupplierSchema, request.body) as CreateSupplierBody;
  const actor = request.user as { id: string };
  const supplier = await createSupplier(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Supplier created successfully', data: supplier }));
}

export async function handleUpdateSupplier(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateSupplierSchema, request.body);
  const actor = request.user as { id: string };
  const supplier = await updateSupplier(id, body, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Supplier updated successfully', data: supplier }));
}

export async function handleDeleteSupplier(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const actor = request.user as { id: string };
  await deleteSupplier(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Supplier deleted successfully' }));
}

export async function handleAddSupplierAddress(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(createAddressSchema, request.body) as CreateAddressBody;
  const address = await addAddress(id, body);
  reply.status(201).send(sendSuccess({ message: 'Address added successfully', data: address }));
}

export async function handleListSupplierAddresses(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const addresses = await listSupplierAddresses(id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Addresses fetched successfully', data: addresses }));
}

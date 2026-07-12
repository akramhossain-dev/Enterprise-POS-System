// ─────────────────────────────────────────────
// Customer Module — Controller
// ─────────────────────────────────────────────

import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  customerQuerySchema,
  createCustomerSchema,
  updateCustomerSchema,
  createAddressSchema,
  CustomerQuery,
  CreateCustomerBody,
  CreateAddressBody,
} from './customer.schema';
import {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addAddress,
  listCustomerAddresses,
} from './customer.service';

export async function handleListCustomers(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(customerQuerySchema, request.query) as CustomerQuery;
  const { customers, meta } = await listCustomers(query);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Customers fetched successfully', data: customers, meta }));
}

export async function handleGetCustomer(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const customer = await getCustomerById(id);
  reply.status(200).send(sendSuccess({ message: 'Customer fetched successfully', data: customer }));
}

export async function handleCreateCustomer(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createCustomerSchema, request.body) as CreateCustomerBody;
  const actor = request.user as { id: string };
  const customer = await createCustomer(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Customer created successfully', data: customer }));
}

export async function handleUpdateCustomer(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateCustomerSchema, request.body);
  const actor = request.user as { id: string };
  const customer = await updateCustomer(id, body, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Customer updated successfully', data: customer }));
}

export async function handleDeleteCustomer(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const actor = request.user as { id: string };
  await deleteCustomer(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Customer deleted successfully' }));
}

export async function handleAddCustomerAddress(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(createAddressSchema, request.body) as CreateAddressBody;
  const address = await addAddress(id, body);
  reply.status(201).send(sendSuccess({ message: 'Address added successfully', data: address }));
}

export async function handleListCustomerAddresses(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const addresses = await listCustomerAddresses(id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Addresses fetched successfully', data: addresses }));
}

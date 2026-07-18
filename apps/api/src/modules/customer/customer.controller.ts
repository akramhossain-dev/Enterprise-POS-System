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
  const query = validateQuery(customerQuerySchema, request.query);
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
  const body = validateBody(createCustomerSchema, request.body);
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
  const body = validateBody(createAddressSchema, request.body);
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

import { prisma } from '../../lib/prisma';
import { ForbiddenError } from '../../common/errors/AppError';
import { getCustomerLedger, getCustomerBalance } from '../customer-ledger/customer-ledger.service';
import { CustomerLedgerQuery } from '../customer-ledger/customer-ledger.types';
import { z } from 'zod';
import { CustomerLedgerEntryType } from '@prisma/client';

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new ForbiddenError('User is not associated with any company profile');
  }
  return employee.companyId;
}

export async function handleGetCustomerLedger(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const actor = request.user as { id: string };

  const querySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    entryType: z.nativeEnum(CustomerLedgerEntryType).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  });

  const query = querySchema.parse(request.query) as CustomerLedgerQuery;
  const companyId = await getCompanyIdForUser(actor.id);

  const result = await getCustomerLedger(id, companyId, query);
  reply.status(200).send(
    sendSuccess({
      message: 'Customer ledger entries retrieved',
      data: result.entries,
      meta: result.meta,
    }),
  );
}

export async function handleGetCustomerBalance(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const actor = request.user as { id: string };

  const companyId = await getCompanyIdForUser(actor.id);
  const result = await getCustomerBalance(id, companyId);
  reply.status(200).send(sendSuccess({ message: 'Customer balance retrieved', data: result }));
}

// ─────────────────────────────────────────────
// Customer Module — Routes
// ─────────────────────────────────────────────

import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListCustomers,
  handleGetCustomer,
  handleCreateCustomer,
  handleUpdateCustomer,
  handleDeleteCustomer,
  handleAddCustomerAddress,
  handleListCustomerAddresses,
  handleGetCustomerLedger,
  handleGetCustomerBalance,
} from './customer.controller';

export async function customerRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('customer.view')],
      schema: { tags: ['Customers'], summary: 'List customers' },
    },
    handleListCustomers,
  );

  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('customer.view')],
      schema: { tags: ['Customers'], summary: 'Get customer by ID' },
    },
    handleGetCustomer,
  );

  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('customer.create')],
      schema: { tags: ['Customers'], summary: 'Create customer' },
    },
    handleCreateCustomer,
  );

  fastify.patch(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('customer.update')],
      schema: { tags: ['Customers'], summary: 'Update customer' },
    },
    handleUpdateCustomer,
  );

  fastify.delete(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('customer.delete')],
      schema: { tags: ['Customers'], summary: 'Soft delete customer' },
    },
    handleDeleteCustomer,
  );

  fastify.get(
    '/:id/addresses',
    {
      preHandler: [authGuard, permissionGuard('customer.view')],
      schema: { tags: ['Customers'], summary: 'List customer addresses' },
    },
    handleListCustomerAddresses,
  );

  fastify.post(
    '/:id/addresses',
    {
      preHandler: [authGuard, permissionGuard('customer.update')],
      schema: { tags: ['Customers'], summary: 'Add customer address' },
    },
    handleAddCustomerAddress,
  );

  fastify.get(
    '/:id/ledger',
    {
      preHandler: [authGuard, permissionGuard('customer.view')],
      schema: { tags: ['Customers'], summary: 'Get customer transaction ledger history' },
    },
    handleGetCustomerLedger,
  );

  fastify.get(
    '/:id/balance',
    {
      preHandler: [authGuard, permissionGuard('customer.view')],
      schema: { tags: ['Customers'], summary: 'Get customer current balance' },
    },
    handleGetCustomerBalance,
  );
}

export default customerRoutes;

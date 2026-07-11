import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListTaxes,
  handleGetTax,
  handleCreateTax,
  handleUpdateTax,
  handleDeleteTax,
} from './tax.controller';

export async function taxRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('tax.read')],
      schema: { tags: ['Taxes'], summary: 'List taxes' },
    },
    handleListTaxes,
  );
  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('tax.read')],
      schema: { tags: ['Taxes'], summary: 'Get tax by ID' },
    },
    handleGetTax,
  );
  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('tax.create')],
      schema: { tags: ['Taxes'], summary: 'Create tax' },
    },
    handleCreateTax,
  );
  fastify.patch(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('tax.update')],
      schema: { tags: ['Taxes'], summary: 'Update tax' },
    },
    handleUpdateTax,
  );
  fastify.delete(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('tax.delete')],
      schema: { tags: ['Taxes'], summary: 'Delete tax' },
    },
    handleDeleteTax,
  );
}

export default taxRoutes;

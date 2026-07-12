// ─────────────────────────────────────────────
// Warehouse Module — Routes
// ─────────────────────────────────────────────

import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListWarehouses,
  handleGetWarehouse,
  handleCreateWarehouse,
  handleUpdateWarehouse,
  handleDeleteWarehouse,
} from './warehouse.controller';

export async function warehouseRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('warehouse.view')],
      schema: { tags: ['Warehouses'], summary: 'List warehouses' },
    },
    handleListWarehouses,
  );

  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('warehouse.view')],
      schema: { tags: ['Warehouses'], summary: 'Get warehouse by ID' },
    },
    handleGetWarehouse,
  );

  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('warehouse.create')],
      schema: { tags: ['Warehouses'], summary: 'Create warehouse' },
    },
    handleCreateWarehouse,
  );

  fastify.patch(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('warehouse.update')],
      schema: { tags: ['Warehouses'], summary: 'Update warehouse' },
    },
    handleUpdateWarehouse,
  );

  fastify.delete(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('warehouse.delete')],
      schema: { tags: ['Warehouses'], summary: 'Soft delete warehouse' },
    },
    handleDeleteWarehouse,
  );
}

export default warehouseRoutes;

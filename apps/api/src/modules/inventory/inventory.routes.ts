// ─────────────────────────────────────────────
// Inventory Module — Routes
// ─────────────────────────────────────────────

import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListInventories,
  handleGetInventory,
  handleGetInventoryByProduct,
  handleGetInventoryByWarehouse,
  handleOpeningStock,
  handleUpdateMinStock,
  handleUpdateReorderLevel,
} from './inventory.controller';

export async function inventoryRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // ── Static paths MUST come before dynamic /:id ─────────────────────────────

  fastify.get(
    '/product/:productId',
    {
      preHandler: [authGuard, permissionGuard('inventory.view')],
      schema: { tags: ['Inventory'], summary: 'Get inventory across all warehouses for a product' },
    },
    handleGetInventoryByProduct,
  );

  fastify.get(
    '/warehouse/:warehouseId',
    {
      preHandler: [authGuard, permissionGuard('inventory.view')],
      schema: { tags: ['Inventory'], summary: 'Get all inventory for a warehouse' },
    },
    handleGetInventoryByWarehouse,
  );

  fastify.post(
    '/opening-stock',
    {
      preHandler: [authGuard, permissionGuard('inventory.opening_stock')],
      schema: {
        tags: ['Inventory'],
        summary: 'Add opening stock (once per product per warehouse)',
      },
    },
    handleOpeningStock,
  );

  fastify.patch(
    '/min-stock',
    {
      preHandler: [authGuard, permissionGuard('inventory.update')],
      schema: { tags: ['Inventory'], summary: 'Update minimum stock and reorder levels' },
    },
    handleUpdateMinStock,
  );

  fastify.patch(
    '/reorder-level',
    {
      preHandler: [authGuard, permissionGuard('inventory.update')],
      schema: { tags: ['Inventory'], summary: 'Update reorder quantity level' },
    },
    handleUpdateReorderLevel,
  );

  // ── Dynamic paths AFTER static paths ─────────────────────────────────────

  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('inventory.view')],
      schema: { tags: ['Inventory'], summary: 'List inventory with search and filters' },
    },
    handleListInventories,
  );

  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('inventory.view')],
      schema: { tags: ['Inventory'], summary: 'Get inventory record by ID' },
    },
    handleGetInventory,
  );
}

export default inventoryRoutes;

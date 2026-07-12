// ─────────────────────────────────────────────
// Stock Movement Module — Routes
// ─────────────────────────────────────────────

import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListStockMovements,
  handleGetStockMovement,
  handleGetMovementsByProduct,
  handleGetMovementsByWarehouse,
} from './stock-movement.controller';

export async function stockMovementRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // Static paths BEFORE dynamic /:id

  fastify.get(
    '/product/:productId',
    {
      preHandler: [authGuard, permissionGuard('stock.history')],
      schema: { tags: ['Stock Movements'], summary: 'Get movement history for a product' },
    },
    handleGetMovementsByProduct,
  );

  fastify.get(
    '/warehouse/:warehouseId',
    {
      preHandler: [authGuard, permissionGuard('stock.history')],
      schema: { tags: ['Stock Movements'], summary: 'Get movement history for a warehouse' },
    },
    handleGetMovementsByWarehouse,
  );

  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('stock.view')],
      schema: { tags: ['Stock Movements'], summary: 'List stock movements with filters' },
    },
    handleListStockMovements,
  );

  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('stock.view')],
      schema: { tags: ['Stock Movements'], summary: 'Get stock movement by ID' },
    },
    handleGetStockMovement,
  );
}

export default stockMovementRoutes;

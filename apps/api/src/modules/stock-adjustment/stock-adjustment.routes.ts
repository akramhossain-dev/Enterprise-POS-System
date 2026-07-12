// ─────────────────────────────────────────────
// Stock Adjustment Module — Routes
// ─────────────────────────────────────────────

import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleCreateAdjustment,
  handleListAdjustments,
  handleGetAdjustment,
} from './stock-adjustment.controller';

export async function stockAdjustmentRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('stock.adjust')],
      schema: { tags: ['Stock Adjustments'], summary: 'Create stock adjustment' },
    },
    handleCreateAdjustment,
  );

  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('stock.view')],
      schema: { tags: ['Stock Adjustments'], summary: 'List stock adjustments' },
    },
    handleListAdjustments,
  );

  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('stock.view')],
      schema: { tags: ['Stock Adjustments'], summary: 'Get stock adjustment by ID' },
    },
    handleGetAdjustment,
  );
}

export default stockAdjustmentRoutes;

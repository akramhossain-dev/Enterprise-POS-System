// ─────────────────────────────────────────────
// Stock Transfer Module — Routes
// ─────────────────────────────────────────────

import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleCreateTransfer,
  handleListTransfers,
  handleGetTransfer,
  handleApproveTransfer,
  handleRejectTransfer,
  handleCompleteTransfer,
} from './stock-transfer.controller';

export async function stockTransferRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('stock.transfer')],
      schema: { tags: ['Stock Transfers'], summary: 'Create stock transfer (PENDING)' },
    },
    handleCreateTransfer,
  );

  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('stock.view')],
      schema: { tags: ['Stock Transfers'], summary: 'List stock transfers' },
    },
    handleListTransfers,
  );

  // Static sub-paths BEFORE dynamic /:id

  fastify.patch(
    '/:id/approve',
    {
      preHandler: [authGuard, permissionGuard('stock.approve')],
      schema: { tags: ['Stock Transfers'], summary: 'Approve a pending transfer' },
    },
    handleApproveTransfer,
  );

  fastify.patch(
    '/:id/reject',
    {
      preHandler: [authGuard, permissionGuard('stock.approve')],
      schema: { tags: ['Stock Transfers'], summary: 'Reject a pending transfer' },
    },
    handleRejectTransfer,
  );

  fastify.patch(
    '/:id/complete',
    {
      preHandler: [authGuard, permissionGuard('stock.approve')],
      schema: {
        tags: ['Stock Transfers'],
        summary: 'Complete an approved transfer (executes stock movements)',
      },
    },
    handleCompleteTransfer,
  );

  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('stock.view')],
      schema: { tags: ['Stock Transfers'], summary: 'Get stock transfer by ID' },
    },
    handleGetTransfer,
  );
}

export default stockTransferRoutes;

import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleCreateSalesReturn,
  handleListSalesReturns,
  handleGetSalesReturnDetails,
  handleApproveSalesReturn,
  handleCompleteSalesReturn,
  handleCancelSalesReturn,
} from './sales-return.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function salesReturnRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // Create sales return draft (POST /sales-returns)
  fastify.post(
    '/',
    {
      preHandler: guard('sales.return.create'),
      schema: { tags: ['Sales Returns'], summary: 'Create a sales return draft' },
    },
    handleCreateSalesReturn,
  );

  // List returns (GET /sales-returns)
  fastify.get(
    '/',
    {
      preHandler: guard('sales.return.view'),
      schema: { tags: ['Sales Returns'], summary: 'List sales returns' },
    },
    handleListSalesReturns,
  );

  // Get details (GET /sales-returns/:id)
  fastify.get(
    '/:id',
    {
      preHandler: guard('sales.return.view'),
      schema: { tags: ['Sales Returns'], summary: 'Get details of a sales return' },
    },
    handleGetSalesReturnDetails,
  );

  // Approve return (PATCH /sales-returns/:id/approve)
  fastify.patch(
    '/:id/approve',
    {
      preHandler: guard('sales.return.approve'),
      schema: { tags: ['Sales Returns'], summary: 'Approve a sales return' },
    },
    handleApproveSalesReturn,
  );

  // Complete return (PATCH /sales-returns/:id/complete)
  fastify.patch(
    '/:id/complete',
    {
      preHandler: guard('sales.return.complete'),
      schema: { tags: ['Sales Returns'], summary: 'Complete a sales return and return stock' },
    },
    handleCompleteSalesReturn,
  );

  // Cancel return (PATCH /sales-returns/:id/cancel)
  fastify.patch(
    '/:id/cancel',
    {
      preHandler: guard('sales.return.create'),
      schema: { tags: ['Sales Returns'], summary: 'Cancel a sales return draft or approved' },
    },
    handleCancelSalesReturn,
  );
}

export default salesReturnRoutes;

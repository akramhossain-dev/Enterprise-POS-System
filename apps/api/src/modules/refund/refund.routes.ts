import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { handleCreateRefund, handleGetRefundDetails } from './refund.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function refundRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // Create refund (POST /refunds)
  fastify.post(
    '/',
    {
      preHandler: guard('refund.create'),
      schema: { tags: ['Refunds'], summary: 'Record a cash refund for a returned sale' },
    },
    handleCreateRefund,
  );

  // Get details (GET /refunds/:id)
  fastify.get(
    '/:id',
    {
      preHandler: guard('refund.view'),
      schema: { tags: ['Refunds'], summary: 'Get refund details' },
    },
    handleGetRefundDetails,
  );
}

export default refundRoutes;

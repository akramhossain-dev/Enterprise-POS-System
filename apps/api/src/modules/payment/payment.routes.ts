import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { handleCreatePayment, handleGetSalePaymentsHistory } from './payment.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function paymentRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // Create payment (POST /payments)
  fastify.post(
    '/',
    {
      preHandler: guard('payment.create'),
      schema: { tags: ['Payments'], summary: 'Record additional payment on a sale' },
    },
    handleCreatePayment,
  );

  // Payment history for a sale (GET /payments/:saleId)
  fastify.get(
    '/:saleId',
    {
      preHandler: guard('sale.view'),
      schema: { tags: ['Payments'], summary: 'Get payment history for a specific sale' },
    },
    handleGetSalePaymentsHistory,
  );
}

export default paymentRoutes;

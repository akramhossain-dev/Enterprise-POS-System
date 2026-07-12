import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleCreateSupplierPayment,
  handleListSupplierPayments,
  handleGetSupplierPaymentById,
} from './supplier-payment.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function supplierPaymentRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/',
    { preHandler: guard('supplier.payment.create'), schema: { tags: ['Supplier Payments'] } },
    handleCreateSupplierPayment,
  );

  fastify.get(
    '/',
    { preHandler: guard('supplier.payment.view'), schema: { tags: ['Supplier Payments'] } },
    handleListSupplierPayments,
  );

  fastify.get(
    '/:id',
    { preHandler: guard('supplier.payment.view'), schema: { tags: ['Supplier Payments'] } },
    handleGetSupplierPaymentById,
  );
}

export default supplierPaymentRoutes;

import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleCreatePurchaseReturn,
  handleListPurchaseReturns,
  handleGetPurchaseReturnById,
  handleApprovePurchaseReturn,
  handleCompletePurchaseReturn,
  handleCancelPurchaseReturn,
} from './purchase-return.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function purchaseReturnRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/',
    { preHandler: guard('purchase.return.create'), schema: { tags: ['Purchase Returns'] } },
    handleCreatePurchaseReturn,
  );

  fastify.get(
    '/',
    { preHandler: guard('purchase.return.view'), schema: { tags: ['Purchase Returns'] } },
    handleListPurchaseReturns,
  );

  fastify.get(
    '/:id',
    { preHandler: guard('purchase.return.view'), schema: { tags: ['Purchase Returns'] } },
    handleGetPurchaseReturnById,
  );

  fastify.patch(
    '/:id/approve',
    { preHandler: guard('purchase.return.approve'), schema: { tags: ['Purchase Returns'] } },
    handleApprovePurchaseReturn,
  );

  fastify.patch(
    '/:id/complete',
    { preHandler: guard('purchase.return.complete'), schema: { tags: ['Purchase Returns'] } },
    handleCompletePurchaseReturn,
  );

  fastify.patch(
    '/:id/cancel',
    { preHandler: guard('purchase.return.complete'), schema: { tags: ['Purchase Returns'] } },
    handleCancelPurchaseReturn,
  );
}

export default purchaseReturnRoutes;

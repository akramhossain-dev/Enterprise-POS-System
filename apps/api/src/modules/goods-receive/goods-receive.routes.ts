import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleCreateGRN,
  handleListGRNs,
  handleGetGRNById,
  handleCompleteGRN,
  handleCancelGRN,
} from './goods-receive.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function goodsReceiveRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/',
    { preHandler: guard('purchase.receive'), schema: { tags: ['Goods Receive'] } },
    handleCreateGRN,
  );

  fastify.get(
    '/',
    { preHandler: guard('purchase.receive.view'), schema: { tags: ['Goods Receive'] } },
    handleListGRNs,
  );

  fastify.get(
    '/:id',
    { preHandler: guard('purchase.receive.view'), schema: { tags: ['Goods Receive'] } },
    handleGetGRNById,
  );

  fastify.patch(
    '/:id/complete',
    { preHandler: guard('purchase.receive.complete'), schema: { tags: ['Goods Receive'] } },
    handleCompleteGRN,
  );

  fastify.patch(
    '/:id/cancel',
    { preHandler: guard('purchase.receive'), schema: { tags: ['Goods Receive'] } },
    handleCancelGRN,
  );
}

export default goodsReceiveRoutes;

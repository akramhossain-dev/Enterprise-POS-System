import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListPurchaseRequisitions,
  handleGetPurchaseRequisition,
  handleCreatePurchaseRequisition,
  handleUpdatePurchaseRequisition,
  handleDeletePurchaseRequisition,
} from './purchase-requisition.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function purchaseRequisitionRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: guard('purchase.read'),
      schema: { tags: ['Purchase Requisitions'], summary: 'List purchase requisitions' },
    },
    handleListPurchaseRequisitions,
  );
  fastify.get(
    '/:id',
    {
      preHandler: guard('purchase.read'),
      schema: { tags: ['Purchase Requisitions'], summary: 'Get purchase requisition by ID' },
    },
    handleGetPurchaseRequisition,
  );
  fastify.post(
    '/',
    {
      preHandler: guard('purchase.create'),
      schema: { tags: ['Purchase Requisitions'], summary: 'Create purchase requisition' },
    },
    handleCreatePurchaseRequisition,
  );
  fastify.put(
    '/:id',
    {
      preHandler: guard('purchase.update'),
      schema: { tags: ['Purchase Requisitions'], summary: 'Update purchase requisition' },
    },
    handleUpdatePurchaseRequisition,
  );
  fastify.delete(
    '/:id',
    {
      preHandler: guard('purchase.delete'),
      schema: { tags: ['Purchase Requisitions'], summary: 'Delete purchase requisition' },
    },
    handleDeletePurchaseRequisition,
  );
}

export default purchaseRequisitionRoutes;

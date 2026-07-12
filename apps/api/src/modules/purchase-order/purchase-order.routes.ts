import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  purchaseOrderQuerySchema,
  PurchaseOrderQuery,
} from './purchase-order.schema';
import {
  createPO,
  listPOs,
  getPOById,
  updatePO,
  submitPO,
  approvePO,
  rejectPO,
  cancelPO,
  deletePO,
} from './purchase-order.service';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function purchaseOrderRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/',
    { preHandler: guard('purchase.create'), schema: { tags: ['Purchase Orders'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const body = validateBody(createPurchaseOrderSchema, req.body);
      const actor = req.user as { id: string };
      const data = await createPO(body, actor.id);
      reply.status(201).send(sendSuccess({ message: 'Purchase order created', data }));
    },
  );

  fastify.get(
    '/',
    { preHandler: guard('purchase.view'), schema: { tags: ['Purchase Orders'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const query = validateQuery(
        purchaseOrderQuerySchema as unknown as import('zod').ZodSchema<PurchaseOrderQuery>,
        req.query,
      );
      const { orders, meta } = await listPOs(query);
      reply
        .status(200)
        .send(sendSuccess({ message: 'Purchase orders fetched', data: orders, meta }));
    },
  );

  fastify.get(
    '/:id',
    { preHandler: guard('purchase.view'), schema: { tags: ['Purchase Orders'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const data = await getPOById(id);
      reply.status(200).send(sendSuccess({ message: 'Purchase order fetched', data }));
    },
  );

  fastify.patch(
    '/:id',
    { preHandler: guard('purchase.update'), schema: { tags: ['Purchase Orders'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const body = validateBody(updatePurchaseOrderSchema, req.body);
      const data = await updatePO(id, body);
      reply.status(200).send(sendSuccess({ message: 'Purchase order updated', data }));
    },
  );

  fastify.delete(
    '/:id',
    { preHandler: guard('purchase.delete'), schema: { tags: ['Purchase Orders'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      await deletePO(id);
      reply.status(200).send(sendSuccess({ message: 'Purchase order deleted' }));
    },
  );

  fastify.patch(
    '/:id/submit',
    {
      preHandler: guard('purchase.update'),
      schema: { tags: ['Purchase Orders'], summary: 'Submit DRAFT purchase order' },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const data = await submitPO(id);
      reply.status(200).send(sendSuccess({ message: 'Purchase order submitted', data }));
    },
  );

  fastify.patch(
    '/:id/approve',
    {
      preHandler: guard('purchase.approve'),
      schema: { tags: ['Purchase Orders'], summary: 'Approve PENDING purchase order' },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const actor = req.user as { id: string };
      const data = await approvePO(id, actor.id);
      reply.status(200).send(sendSuccess({ message: 'Purchase order approved', data }));
    },
  );

  fastify.patch(
    '/:id/reject',
    {
      preHandler: guard('purchase.approve'),
      schema: { tags: ['Purchase Orders'], summary: 'Reject PENDING purchase order' },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const actor = req.user as { id: string };
      const data = await rejectPO(id, actor.id);
      reply.status(200).send(sendSuccess({ message: 'Purchase order rejected', data }));
    },
  );

  fastify.patch(
    '/:id/cancel',
    {
      preHandler: guard('purchase.update'),
      schema: { tags: ['Purchase Orders'], summary: 'Cancel purchase order' },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const data = await cancelPO(id);
      reply.status(200).send(sendSuccess({ message: 'Purchase order cancelled', data }));
    },
  );
}

export default purchaseOrderRoutes;

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  createReconciliationSchema,
  approveReconciliationSchema,
  reconciliationQuerySchema,
  ReconciliationQuery,
} from './reconciliation.schema';
import {
  createRecon,
  approveRecon,
  rejectRecon,
  listRecons,
  getReconById,
} from './reconciliation.service';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function reconciliationRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/',
    {
      preHandler: guard('inventory.reconcile'),
      schema: {
        tags: ['Reconciliation'],
        summary: 'Create reconciliation from completed stock take',
      },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const body = validateBody(createReconciliationSchema, req.body);
      const actor = req.user as { id: string };
      reply.status(201).send(
        sendSuccess({
          message: 'Reconciliation created',
          data: await createRecon(body, actor.id),
        }),
      );
    },
  );

  fastify.get(
    '/',
    { preHandler: guard('inventory.reconcile'), schema: { tags: ['Reconciliation'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const query = validateQuery(
        reconciliationQuerySchema as unknown as import('zod').ZodSchema<ReconciliationQuery>,
        req.query,
      );
      const { reconciliations, meta } = await listRecons(query);
      reply
        .status(200)
        .send(sendSuccess({ message: 'Reconciliations fetched', data: reconciliations, meta }));
    },
  );

  fastify.get(
    '/:id',
    { preHandler: guard('inventory.reconcile'), schema: { tags: ['Reconciliation'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      reply
        .status(200)
        .send(sendSuccess({ message: 'Reconciliation fetched', data: await getReconById(id) }));
    },
  );

  fastify.patch(
    '/:id/approve',
    {
      preHandler: guard('inventory.reconcile'),
      schema: { tags: ['Reconciliation'], summary: 'Approve and apply adjustments' },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const body = validateBody(approveReconciliationSchema, req.body ?? {});
      const actor = req.user as { id: string };
      reply.status(200).send(
        sendSuccess({
          message: 'Reconciliation approved and adjustments applied',
          data: await approveRecon(id, body, actor.id),
        }),
      );
    },
  );

  fastify.patch(
    '/:id/reject',
    { preHandler: guard('inventory.reconcile'), schema: { tags: ['Reconciliation'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const body = validateBody(approveReconciliationSchema, req.body ?? {});
      const actor = req.user as { id: string };
      reply.status(200).send(
        sendSuccess({
          message: 'Reconciliation rejected',
          data: await rejectRecon(id, body, actor.id),
        }),
      );
    },
  );
}

export default reconciliationRoutes;

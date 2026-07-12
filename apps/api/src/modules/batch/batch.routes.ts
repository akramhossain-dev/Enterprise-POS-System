import { FastifyInstance } from 'fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  createBatchSchema,
  updateBatchStatusSchema,
  batchQuerySchema,
  BatchQuery,
} from './batch.schema';
import {
  addBatch,
  getBatchById,
  listBatches,
  changeBatchStatus,
  expireOldBatches,
} from './batch.service';

async function handleCreate(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = validateBody(createBatchSchema, req.body);
  const actor = req.user as { id: string };
  reply
    .status(201)
    .send(sendSuccess({ message: 'Batch created', data: await addBatch(body, actor.id) }));
}

async function handleList(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = validateQuery(
    batchQuerySchema as unknown as import('zod').ZodSchema<BatchQuery>,
    req.query,
  );
  const { batches, meta } = await listBatches(query);
  reply.status(200).send(sendSuccess({ message: 'Batches fetched', data: batches, meta }));
}

async function handleGetById(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  reply.status(200).send(sendSuccess({ message: 'Batch fetched', data: await getBatchById(id) }));
}

async function handleUpdateStatus(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const body = validateBody(updateBatchStatusSchema, req.body);
  reply
    .status(200)
    .send(
      sendSuccess({ message: 'Batch status updated', data: await changeBatchStatus(id, body) }),
    );
}

async function handleExpireOld(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  void req;
  const result = await expireOldBatches();
  reply
    .status(200)
    .send(sendSuccess({ message: `Expired ${String(result.count)} batches`, data: result }));
}

export async function batchRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();
  const guard = (p: string) => [authGuard, permissionGuard(p)];

  fastify.post(
    '/',
    { preHandler: guard('inventory.batch'), schema: { tags: ['Batches'] } },
    handleCreate,
  );
  fastify.get(
    '/',
    { preHandler: guard('inventory.batch'), schema: { tags: ['Batches'] } },
    handleList,
  );
  fastify.post(
    '/expire-old',
    {
      preHandler: guard('inventory.batch'),
      schema: { tags: ['Batches'], summary: 'Trigger expiry job' },
    },
    handleExpireOld,
  );
  fastify.get(
    '/:id',
    { preHandler: guard('inventory.batch'), schema: { tags: ['Batches'] } },
    handleGetById,
  );
  fastify.patch(
    '/:id/status',
    { preHandler: guard('inventory.batch'), schema: { tags: ['Batches'] } },
    handleUpdateStatus,
  );
}

export default batchRoutes;

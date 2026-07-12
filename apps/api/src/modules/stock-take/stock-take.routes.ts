import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  createStockTakeSchema,
  addItemSchema,
  bulkAddItemsSchema,
  stockTakeQuerySchema,
  StockTakeQuery,
} from './stock-take.schema';
import {
  initiateStockTake,
  populateStockTake,
  addOrUpdateItem,
  bulkAddItems,
  startStockTake,
  completeStockTake,
  cancelStockTake,
  listStockTakes,
  getStockTakeById,
} from './stock-take.service';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function stockTakeRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/',
    { preHandler: guard('inventory.stocktake'), schema: { tags: ['Stock Take'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const body = validateBody(createStockTakeSchema, req.body);
      const actor = req.user as { id: string };
      reply.status(201).send(
        sendSuccess({
          message: 'Stock take created',
          data: await initiateStockTake(body, actor.id),
        }),
      );
    },
  );

  fastify.get(
    '/',
    { preHandler: guard('inventory.stocktake'), schema: { tags: ['Stock Take'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const query = validateQuery(
        stockTakeQuerySchema as unknown as import('zod').ZodSchema<StockTakeQuery>,
        req.query,
      );
      const { stockTakes, meta } = await listStockTakes(query);
      reply
        .status(200)
        .send(sendSuccess({ message: 'Stock takes fetched', data: stockTakes, meta }));
    },
  );

  fastify.get(
    '/:id',
    { preHandler: guard('inventory.stocktake'), schema: { tags: ['Stock Take'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      reply
        .status(200)
        .send(sendSuccess({ message: 'Stock take fetched', data: await getStockTakeById(id) }));
    },
  );

  fastify.post(
    '/:id/populate',
    {
      preHandler: guard('inventory.stocktake'),
      schema: { tags: ['Stock Take'], summary: 'Auto-populate items from current inventory' },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      reply
        .status(200)
        .send(sendSuccess({ message: 'Items populated', data: await populateStockTake(id) }));
    },
  );

  fastify.post(
    '/:id/items',
    {
      preHandler: guard('inventory.stocktake'),
      schema: { tags: ['Stock Take'], summary: 'Add or update single item' },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const body = validateBody(addItemSchema, req.body);
      reply
        .status(200)
        .send(sendSuccess({ message: 'Item updated', data: await addOrUpdateItem(id, body) }));
    },
  );

  fastify.post(
    '/:id/items/bulk',
    {
      preHandler: guard('inventory.stocktake'),
      schema: { tags: ['Stock Take'], summary: 'Bulk add or update items' },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const body = validateBody(bulkAddItemsSchema, req.body);
      reply
        .status(200)
        .send(sendSuccess({ message: 'Items updated', data: await bulkAddItems(id, body) }));
    },
  );

  fastify.patch(
    '/:id/start',
    { preHandler: guard('inventory.stocktake'), schema: { tags: ['Stock Take'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      void req.body;
      const { id } = req.params as { id: string };
      reply
        .status(200)
        .send(sendSuccess({ message: 'Stock take started', data: await startStockTake(id) }));
    },
  );

  fastify.patch(
    '/:id/complete',
    { preHandler: guard('inventory.stocktake'), schema: { tags: ['Stock Take'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      void req.body;
      const { id } = req.params as { id: string };
      reply
        .status(200)
        .send(sendSuccess({ message: 'Stock take completed', data: await completeStockTake(id) }));
    },
  );

  fastify.patch(
    '/:id/cancel',
    { preHandler: guard('inventory.stocktake'), schema: { tags: ['Stock Take'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      void req.body;
      const { id } = req.params as { id: string };
      reply
        .status(200)
        .send(sendSuccess({ message: 'Stock take cancelled', data: await cancelStockTake(id) }));
    },
  );
}

export default stockTakeRoutes;

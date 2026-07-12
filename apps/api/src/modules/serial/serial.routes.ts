import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  createSerialSchema,
  createSerialBulkSchema,
  updateSerialStatusSchema,
  serialQuerySchema,
  SerialQuery,
} from './serial.schema';
import {
  registerSerial,
  registerSerialBulk,
  listSerials,
  getSerialById,
  changeSerialStatus,
} from './serial.service';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function serialRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/',
    { preHandler: guard('inventory.serial'), schema: { tags: ['Serials'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const body = validateBody(createSerialSchema, req.body);
      const actor = req.user as { id: string };
      reply
        .status(201)
        .send(
          sendSuccess({ message: 'Serial registered', data: await registerSerial(body, actor.id) }),
        );
    },
  );

  fastify.post(
    '/bulk',
    {
      preHandler: guard('inventory.serial'),
      schema: { tags: ['Serials'], summary: 'Bulk register serial numbers' },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const body = validateBody(createSerialBulkSchema, req.body);
      const actor = req.user as { id: string };
      reply.status(201).send(
        sendSuccess({
          message: 'Bulk serials registered',
          data: await registerSerialBulk(body, actor.id),
        }),
      );
    },
  );

  fastify.get(
    '/',
    { preHandler: guard('inventory.serial'), schema: { tags: ['Serials'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const query = validateQuery(
        serialQuerySchema as unknown as import('zod').ZodSchema<SerialQuery>,
        req.query,
      );
      const { serials, meta } = await listSerials(query);
      reply.status(200).send(sendSuccess({ message: 'Serials fetched', data: serials, meta }));
    },
  );

  fastify.get(
    '/:id',
    { preHandler: guard('inventory.serial'), schema: { tags: ['Serials'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      reply
        .status(200)
        .send(sendSuccess({ message: 'Serial fetched', data: await getSerialById(id) }));
    },
  );

  fastify.patch(
    '/:id/status',
    { preHandler: guard('inventory.serial'), schema: { tags: ['Serials'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const body = validateBody(updateSerialStatusSchema, req.body);
      reply.status(200).send(
        sendSuccess({
          message: 'Serial status updated',
          data: await changeSerialStatus(id, body),
        }),
      );
    },
  );
}

export default serialRoutes;

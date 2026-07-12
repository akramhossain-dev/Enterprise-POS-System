import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  alertQuerySchema,
  AlertQuery,
  resolveAlertSchema,
  scanAlertSchema,
} from './stock-alert.schema';
import {
  listAlerts,
  getAlertById,
  resolveStockAlert,
  runAlertScan,
  fetchReorderSuggestions,
} from './stock-alert.service';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function stockAlertRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    { preHandler: guard('stock.view'), schema: { tags: ['Stock Alerts'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const query = validateQuery(
        alertQuerySchema as unknown as import('zod').ZodSchema<AlertQuery>,
        req.query,
      );
      const { alerts, meta } = await listAlerts(query);
      reply.status(200).send(sendSuccess({ message: 'Alerts fetched', data: alerts, meta }));
    },
  );

  fastify.post(
    '/scan',
    {
      preHandler: guard('stock.view'),
      schema: { tags: ['Stock Alerts'], summary: 'Scan inventories and generate low-stock alerts' },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const body = validateBody(scanAlertSchema, req.body);
      const result = await runAlertScan(body);
      reply.status(200).send(
        sendSuccess({
          message: `Alert scan complete. Created: ${String(result.created)}, Resolved: ${String(result.resolved)}`,
          data: result,
        }),
      );
    },
  );

  fastify.get(
    '/reorder-suggestions',
    {
      preHandler: guard('stock.view'),
      schema: { tags: ['Stock Alerts'], summary: 'Get reorder suggestions for low-stock items' },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { companyId, warehouseId } = req.query as { companyId?: string; warehouseId?: string };
      if (!companyId) {
        reply.status(422).send({ success: false, message: 'companyId is required' });
        return;
      }
      const suggestions = await fetchReorderSuggestions({ companyId, warehouseId });
      reply
        .status(200)
        .send(sendSuccess({ message: 'Reorder suggestions fetched', data: suggestions }));
    },
  );

  fastify.get(
    '/:id',
    { preHandler: guard('stock.view'), schema: { tags: ['Stock Alerts'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      reply
        .status(200)
        .send(sendSuccess({ message: 'Alert fetched', data: await getAlertById(id) }));
    },
  );

  fastify.patch(
    '/:id/resolve',
    { preHandler: guard('stock.approve'), schema: { tags: ['Stock Alerts'] } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      validateBody(resolveAlertSchema, req.body);
      const actor = req.user as { id: string };
      reply
        .status(200)
        .send(
          sendSuccess({ message: 'Alert resolved', data: await resolveStockAlert(id, actor.id) }),
        );
    },
  );
}

export default stockAlertRoutes;

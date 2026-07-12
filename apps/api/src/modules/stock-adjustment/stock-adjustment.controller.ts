// ─────────────────────────────────────────────
// Stock Adjustment Module — Controller
// ─────────────────────────────────────────────

import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  createAdjustmentSchema,
  adjustmentQuerySchema,
  AdjustmentQuery,
} from './stock-adjustment.schema';
import {
  createStockAdjustment,
  listAdjustments,
  getAdjustmentById,
} from './stock-adjustment.service';

export async function handleCreateAdjustment(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createAdjustmentSchema, request.body);
  const actor = request.user as { id: string };
  const adjustment = await createStockAdjustment(body, actor.id);
  reply
    .status(201)
    .send(sendSuccess({ message: 'Stock adjustment applied successfully', data: adjustment }));
}

export async function handleListAdjustments(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(
    adjustmentQuerySchema as unknown as import('zod').ZodSchema<AdjustmentQuery>,
    request.query,
  );
  const { adjustments, meta } = await listAdjustments(query);
  reply
    .status(200)
    .send(
      sendSuccess({ message: 'Stock adjustments fetched successfully', data: adjustments, meta }),
    );
}

export async function handleGetAdjustment(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const adjustment = await getAdjustmentById(id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Stock adjustment fetched successfully', data: adjustment }));
}

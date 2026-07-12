// ─────────────────────────────────────────────
// Stock Movement Module — Controller
// ─────────────────────────────────────────────

import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateQuery } from '../../common/utils/validate';
import { stockMovementQuerySchema, StockMovementQuery } from './stock-movement.schema';
import {
  listStockMovements,
  getStockMovementById,
  getMovementsByProduct,
  getMovementsByWarehouse,
} from './stock-movement.service';

export async function handleListStockMovements(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(
    stockMovementQuerySchema as unknown as import('zod').ZodSchema<StockMovementQuery>,
    request.query,
  );
  const { movements, meta } = await listStockMovements(query);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Stock movements fetched successfully', data: movements, meta }));
}

export async function handleGetStockMovement(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const movement = await getStockMovementById(id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Stock movement fetched successfully', data: movement }));
}

export async function handleGetMovementsByProduct(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { productId } = request.params as { productId: string };
  const { page, limit } = request.query as { page?: number; limit?: number };
  const { movements, meta } = await getMovementsByProduct(productId, {
    ...(page !== undefined ? { page } : {}),
    ...(limit !== undefined ? { limit } : {}),
  });
  reply.status(200).send(
    sendSuccess({
      message: 'Product stock movements fetched successfully',
      data: movements,
      meta,
    }),
  );
}

export async function handleGetMovementsByWarehouse(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { warehouseId } = request.params as { warehouseId: string };
  const { page, limit } = request.query as { page?: number; limit?: number };
  const { movements, meta } = await getMovementsByWarehouse(warehouseId, {
    ...(page !== undefined ? { page } : {}),
    ...(limit !== undefined ? { limit } : {}),
  });
  reply.status(200).send(
    sendSuccess({
      message: 'Warehouse stock movements fetched successfully',
      data: movements,
      meta,
    }),
  );
}

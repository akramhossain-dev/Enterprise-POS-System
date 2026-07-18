// ─────────────────────────────────────────────
// Inventory Module — Controller
// ─────────────────────────────────────────────

import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  inventoryQuerySchema,
  openingStockSchema,
  updateMinStockSchema,
  updateReorderLevelSchema,
  InventoryQuery,
  OpeningStockBody,
} from './inventory.schema';
import {
  listInventories,
  getInventoryById,
  getInventoryByProduct,
  getInventoryByWarehouse,
  addOpeningStock,
  updateMinStock,
  updateReorderLevel,
} from './inventory.service';

export async function handleListInventories(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(
    inventoryQuerySchema as unknown as import('zod').ZodSchema<InventoryQuery>,
    request.query,
  );
  const { inventories, meta } = await listInventories(query);

  reply
    .status(200)
    .send(sendSuccess({ message: 'Inventory fetched successfully', data: inventories, meta }));
}

export async function handleGetInventory(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const inv = await getInventoryById(id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Inventory record fetched successfully', data: inv }));
}

export async function handleGetInventoryByProduct(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { productId } = request.params as { productId: string };
  const inventories = await getInventoryByProduct(productId);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Product inventory fetched successfully', data: inventories }));
}

export async function handleGetInventoryByWarehouse(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { warehouseId } = request.params as { warehouseId: string };
  const inventories = await getInventoryByWarehouse(warehouseId);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Warehouse inventory fetched successfully', data: inventories }));
}

export async function handleOpeningStock(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(openingStockSchema, request.body);
  const actor = request.user as { id: string };
  const inv = await addOpeningStock(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Opening stock added successfully', data: inv }));
}

export async function handleUpdateMinStock(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(updateMinStockSchema, request.body);
  const actor = request.user as { id: string };
  const inv = await updateMinStock(body, actor.id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Minimum stock level updated successfully', data: inv }));
}

export async function handleUpdateReorderLevel(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(updateReorderLevelSchema, request.body);
  const actor = request.user as { id: string };
  const inv = await updateReorderLevel(body, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Reorder level updated successfully', data: inv }));
}

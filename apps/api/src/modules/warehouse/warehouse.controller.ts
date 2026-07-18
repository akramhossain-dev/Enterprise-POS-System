// ─────────────────────────────────────────────
// Warehouse Module — Controller
// ─────────────────────────────────────────────

import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  warehouseQuerySchema,
  createWarehouseSchema,
  updateWarehouseSchema,
  WarehouseQuery,
  CreateWarehouseBody,
} from './warehouse.schema';
import {
  listWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from './warehouse.service';

export async function handleListWarehouses(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(warehouseQuerySchema, request.query);
  const { warehouses, meta } = await listWarehouses(query);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Warehouses fetched successfully', data: warehouses, meta }));
}

export async function handleGetWarehouse(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const warehouse = await getWarehouseById(id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Warehouse fetched successfully', data: warehouse }));
}

export async function handleCreateWarehouse(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createWarehouseSchema, request.body);
  const actor = request.user as { id: string };
  const warehouse = await createWarehouse(body, actor.id);
  reply
    .status(201)
    .send(sendSuccess({ message: 'Warehouse created successfully', data: warehouse }));
}

export async function handleUpdateWarehouse(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateWarehouseSchema, request.body);
  const actor = request.user as { id: string };
  const warehouse = await updateWarehouse(id, body, actor.id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Warehouse updated successfully', data: warehouse }));
}

export async function handleDeleteWarehouse(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const actor = request.user as { id: string };
  await deleteWarehouse(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Warehouse deleted successfully' }));
}

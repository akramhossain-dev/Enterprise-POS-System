// ─────────────────────────────────────────────
// Warehouse Module — Service Layer
// ─────────────────────────────────────────────

import { ConflictError, NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import { CreateWarehouseBody, UpdateWarehouseBody, WarehouseQuery } from './warehouse.schema';
import {
  findWarehouses,
  findWarehouseById as repoFindById,
  findWarehouseByCode,
  createWarehouse as repoCreate,
  updateWarehouse as repoUpdate,
  softDeleteWarehouse as repoSoftDelete,
  countWarehouseInventory,
} from './warehouse.repository';
import { mapWarehouse, mapWarehouseList, MappedWarehouse } from './warehouse.mapper';
import { WarehouseAuditPayload } from './warehouse.types';
import { recordAuditLog } from '../audit/audit.service';

// ── Audit event ────────────────────────────────────────────────────────────────

async function emitAuditEvent(payload: WarehouseAuditPayload): Promise<void> {
  try {
    await recordAuditLog({
      userId: payload.actorId,
      action: payload.action,
      entityType: 'Warehouse',
      entityId: payload.warehouseId,
      newValue: {
        warehouseCode: payload.warehouseCode,
        changes: payload.changes,
      },
      description: `Warehouse ${payload.action.toLowerCase()}: ${payload.warehouseCode}`,
    });
  } catch (err) {
    const { createLogger } = await import('../../lib/logger');
    createLogger('warehouse-audit').error({ err }, 'Failed to record warehouse audit log');
  }
}

// ── List ───────────────────────────────────────────────────────────────────────

export async function listWarehouses(query: WarehouseQuery): Promise<{
  warehouses: MappedWarehouse[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { warehouses, meta } = await findWarehouses(query);
  return { warehouses: mapWarehouseList(warehouses), meta };
}

// ── Get by ID ──────────────────────────────────────────────────────────────────

export async function getWarehouseById(id: string): Promise<MappedWarehouse> {
  const wh = await repoFindById(id);
  if (!wh) {
    throw new NotFoundError(`Warehouse with ID "${id}" not found`);
  }
  return mapWarehouse(wh);
}

// ── Create ─────────────────────────────────────────────────────────────────────

export async function createWarehouse(
  body: CreateWarehouseBody,
  actorId: string,
): Promise<MappedWarehouse> {
  const dup = await findWarehouseByCode(body.code);
  if (dup) {
    throw new ConflictError(`Warehouse code "${body.code}" is already in use`);
  }

  const wh = await repoCreate(body);

  await emitAuditEvent({
    actorId,
    warehouseId: wh.id,
    warehouseCode: wh.code,
    action: 'CREATED',
  });

  return mapWarehouse(wh);
}

// ── Update ─────────────────────────────────────────────────────────────────────

export async function updateWarehouse(
  id: string,
  body: UpdateWarehouseBody,
  actorId: string,
): Promise<MappedWarehouse> {
  const existing = await repoFindById(id);
  if (!existing) {
    throw new NotFoundError(`Warehouse with ID "${id}" not found`);
  }

  const updated = await repoUpdate(id, existing.companyId, body);

  await emitAuditEvent({
    actorId,
    warehouseId: updated.id,
    warehouseCode: updated.code,
    action: 'UPDATED',
    changes: body,
  });

  return mapWarehouse(updated);
}

// ── Soft Delete ────────────────────────────────────────────────────────────────

export async function deleteWarehouse(id: string, actorId: string): Promise<void> {
  const existing = await repoFindById(id);
  if (!existing) {
    throw new NotFoundError(`Warehouse with ID "${id}" not found`);
  }

  const inventoryCount = await countWarehouseInventory(id);
  if (inventoryCount > 0) {
    throw new ConflictError(
      `Cannot delete warehouse "${existing.name}" — it has ${String(inventoryCount)} active inventory records. Transfer stock first.`,
    );
  }

  await repoSoftDelete(id);

  await emitAuditEvent({
    actorId,
    warehouseId: existing.id,
    warehouseCode: existing.code,
    action: 'DELETED',
  });
}

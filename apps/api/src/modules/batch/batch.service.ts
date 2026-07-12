import { ConflictError, NotFoundError } from '../../common/errors/AppError';

import { buildPaginationMeta } from '../../common/utils/query';
import { CreateBatchBody, UpdateBatchStatusBody, BatchQuery } from './batch.schema';
import {
  findBatches,
  findBatchById,
  findBatchByNumber,
  createBatch,
  updateBatchStatus,
  markExpiredBatches,
} from './batch.repository';
import { mapBatch, mapBatchList, MappedBatch } from './batch.mapper';
import { findWarehouseById } from '../warehouse/warehouse.repository';
import { prisma } from '../../lib/prisma';

export async function addBatch(body: CreateBatchBody, actorId: string): Promise<MappedBatch> {
  const wh = await findWarehouseById(body.warehouseId);
  if (!wh) {
    throw new NotFoundError(`Warehouse "${body.warehouseId}" not found`);
  }

  const product = await prisma.product.findFirst({
    where: { id: body.productId },
    select: { id: true },
  });
  if (!product) {
    throw new NotFoundError(`Product "${body.productId}" not found`);
  }

  const existing = await findBatchByNumber(body.warehouseId, body.productId, body.batchNumber);
  if (existing) {
    throw new ConflictError(
      `Batch number "${body.batchNumber}" already exists for this product in this warehouse`,
    );
  }

  // Validate: expiryDate must be in the future
  if (body.expiryDate && new Date(body.expiryDate) < new Date()) {
    throw new ConflictError(`Expiry date is already in the past`);
  }

  const batch = await createBatch({ ...body, createdBy: actorId });
  return mapBatch(batch);
}

export async function getBatchById(id: string): Promise<MappedBatch> {
  const b = await findBatchById(id);
  if (!b) {
    throw new NotFoundError(`Batch "${id}" not found`);
  }
  return mapBatch(b);
}

export async function listBatches(
  query: BatchQuery,
): Promise<{ batches: MappedBatch[]; meta: ReturnType<typeof buildPaginationMeta> }> {
  const { batches, meta } = await findBatches(query);
  return { batches: mapBatchList(batches), meta };
}

export async function changeBatchStatus(
  id: string,
  body: UpdateBatchStatusBody,
): Promise<MappedBatch> {
  const b = await findBatchById(id);
  if (!b) {
    throw new NotFoundError(`Batch "${id}" not found`);
  }
  const updated = await updateBatchStatus(id, body.status, body.remarks);

  return mapBatch(updated);
}

export async function expireOldBatches(): Promise<{ count: number }> {
  const count = await markExpiredBatches();
  return { count };
}

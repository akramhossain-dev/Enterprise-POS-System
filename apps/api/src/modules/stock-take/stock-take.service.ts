import { StockTakeStatus } from '@prisma/client';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import {
  CreateStockTakeBody,
  AddItemBody,
  BulkAddItemsBody,
  StockTakeQuery,
} from './stock-take.schema';
import {
  findStockTakes,
  findStockTakeById,
  createStockTake,
  upsertStockTakeItem,
  updateStockTakeStatus,
  populateItemsFromInventory,
} from './stock-take.repository';
import { mapStockTake, mapStockTakeList, MappedStockTake } from './stock-take.mapper';
import { prisma } from '../../lib/prisma';
import { findWarehouseById } from '../warehouse/warehouse.repository';

export async function initiateStockTake(
  body: CreateStockTakeBody,
  actorId: string,
): Promise<MappedStockTake> {
  const wh = await findWarehouseById(body.warehouseId);
  if (!wh) {
    throw new NotFoundError(`Warehouse "${body.warehouseId}" not found`);
  }

  const st = await createStockTake({ ...body, createdBy: actorId });
  return mapStockTake(st);
}

export async function populateStockTake(id: string): Promise<{ count: number }> {
  const st = await findStockTakeById(id);
  if (!st) {
    throw new NotFoundError(`Stock take "${id}" not found`);
  }
  if (st.status !== StockTakeStatus.DRAFT && st.status !== StockTakeStatus.IN_PROGRESS) {
    throw new BadRequestError(`Cannot populate items on a ${st.status} stock take`);
  }
  const count = await populateItemsFromInventory(id, st.warehouseId, st.companyId);
  return { count };
}

export async function addOrUpdateItem(id: string, body: AddItemBody): Promise<MappedStockTake> {
  const st = await findStockTakeById(id);
  if (!st) {
    throw new NotFoundError(`Stock take "${id}" not found`);
  }
  if (st.status === StockTakeStatus.COMPLETED || st.status === StockTakeStatus.CANCELLED) {
    throw new BadRequestError(`Cannot add items to a ${st.status} stock take`);
  }

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: body.productId },
    select: { id: true },
  });
  if (!product) {
    throw new NotFoundError(`Product "${body.productId}" not found`);
  }

  // Get current system quantity for this product in the warehouse
  const inv = await prisma.inventory.findUnique({
    where: { warehouseId_productId: { warehouseId: st.warehouseId, productId: body.productId } },
    select: { availableQuantity: true },
  });
  const systemQty = inv ? Number(inv.availableQuantity.toString()) : 0;

  await upsertStockTakeItem(id, body.productId, systemQty, body.physicalQuantity, body.remarks);

  const updatedSt = await findStockTakeById(id);
  if (!updatedSt) {
    throw new NotFoundError(`Stock take "${id}" not found`);
  }
  return mapStockTake(updatedSt);
}

export async function bulkAddItems(id: string, body: BulkAddItemsBody): Promise<MappedStockTake> {
  const st = await findStockTakeById(id);
  if (!st) {
    throw new NotFoundError(`Stock take "${id}" not found`);
  }
  if (st.status === StockTakeStatus.COMPLETED || st.status === StockTakeStatus.CANCELLED) {
    throw new BadRequestError(`Cannot add items to a ${st.status} stock take`);
  }

  for (const item of body.items) {
    const inv = await prisma.inventory.findUnique({
      where: { warehouseId_productId: { warehouseId: st.warehouseId, productId: item.productId } },
      select: { availableQuantity: true },
    });
    const systemQty = inv ? Number(inv.availableQuantity.toString()) : 0;
    await upsertStockTakeItem(id, item.productId, systemQty, item.physicalQuantity, item.remarks);
  }

  const updatedSt2 = await findStockTakeById(id);
  if (!updatedSt2) {
    throw new NotFoundError(`Stock take "${id}" not found after update`);
  }
  return mapStockTake(updatedSt2);
}

export async function startStockTake(id: string): Promise<MappedStockTake> {
  const st = await findStockTakeById(id);
  if (!st) {
    throw new NotFoundError(`Stock take "${id}" not found`);
  }
  if (st.status !== StockTakeStatus.DRAFT) {
    throw new ConflictError(`Stock take must be DRAFT to start. Current: ${st.status}`);
  }
  return mapStockTake(await updateStockTakeStatus(id, StockTakeStatus.IN_PROGRESS));
}

export async function completeStockTake(id: string): Promise<MappedStockTake> {
  const st = await findStockTakeById(id);
  if (!st) {
    throw new NotFoundError(`Stock take "${id}" not found`);
  }
  if (st.status !== StockTakeStatus.IN_PROGRESS) {
    throw new ConflictError(`Stock take must be IN_PROGRESS to complete. Current: ${st.status}`);
  }
  if (st.items.length === 0) {
    throw new BadRequestError(`Stock take has no items`);
  }
  return mapStockTake(await updateStockTakeStatus(id, StockTakeStatus.COMPLETED, new Date()));
}

export async function cancelStockTake(id: string): Promise<MappedStockTake> {
  const st = await findStockTakeById(id);
  if (!st) {
    throw new NotFoundError(`Stock take "${id}" not found`);
  }
  if (st.status === StockTakeStatus.COMPLETED) {
    throw new ConflictError(`Cannot cancel a COMPLETED stock take`);
  }
  return mapStockTake(await updateStockTakeStatus(id, StockTakeStatus.CANCELLED));
}

export async function listStockTakes(
  query: StockTakeQuery,
): Promise<{ stockTakes: MappedStockTake[]; meta: ReturnType<typeof buildPaginationMeta> }> {
  const { stockTakes, meta } = await findStockTakes(query);
  return { stockTakes: mapStockTakeList(stockTakes), meta };
}

export async function getStockTakeById(id: string): Promise<MappedStockTake> {
  const st = await findStockTakeById(id);
  if (!st) {
    throw new NotFoundError(`Stock take "${id}" not found`);
  }
  return mapStockTake(st);
}

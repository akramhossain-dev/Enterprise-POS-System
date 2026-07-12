import { ConflictError, NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import {
  CreateSerialBody,
  CreateSerialBulkBody,
  UpdateSerialStatusBody,
  SerialQuery,
} from './serial.schema';
import {
  findSerials,
  findSerialById,
  findSerialByNumber,
  createSerial,
  createSerialBulk,
  updateSerialStatus,
} from './serial.repository';
import { mapSerial, mapSerialList, MappedSerial } from './serial.mapper';
import { prisma } from '../../lib/prisma';

async function validateWarehouseProduct(warehouseId: string, productId: string): Promise<void> {
  const [wh, prod] = await Promise.all([
    prisma.warehouse.findUnique({ where: { id: warehouseId }, select: { id: true } }),
    prisma.product.findUnique({ where: { id: productId }, select: { id: true } }),
  ]);
  if (!wh) {
    throw new NotFoundError(`Warehouse "${warehouseId}" not found`);
  }
  if (!prod) {
    throw new NotFoundError(`Product "${productId}" not found`);
  }
}

export async function registerSerial(
  body: CreateSerialBody,
  actorId: string,
): Promise<MappedSerial> {
  await validateWarehouseProduct(body.warehouseId, body.productId);

  const existing = await findSerialByNumber(body.serialNumber);
  if (existing) {
    throw new ConflictError(`Serial number "${body.serialNumber}" already exists`);
  }

  const s = await createSerial({
    companyId: body.companyId,
    warehouseId: body.warehouseId,
    productId: body.productId,
    serialNumber: body.serialNumber,
    createdBy: actorId,
    ...(body.remarks ? { remarks: body.remarks } : {}),
  });
  return mapSerial(s);
}

export async function registerSerialBulk(
  body: CreateSerialBulkBody,
  actorId: string,
): Promise<{ created: number; skipped: number }> {
  await validateWarehouseProduct(body.warehouseId, body.productId);

  const count = await createSerialBulk(
    {
      companyId: body.companyId,
      warehouseId: body.warehouseId,
      productId: body.productId,
      createdBy: actorId,
    },
    body.serialNumbers,
  );
  return { created: count, skipped: body.serialNumbers.length - count };
}

export async function listSerials(
  query: SerialQuery,
): Promise<{ serials: MappedSerial[]; meta: ReturnType<typeof buildPaginationMeta> }> {
  const { serials, meta } = await findSerials(query);
  return { serials: mapSerialList(serials), meta };
}

export async function getSerialById(id: string): Promise<MappedSerial> {
  const s = await findSerialById(id);
  if (!s) {
    throw new NotFoundError(`Serial "${id}" not found`);
  }
  return mapSerial(s);
}

export async function changeSerialStatus(
  id: string,
  body: UpdateSerialStatusBody,
): Promise<MappedSerial> {
  const s = await findSerialById(id);
  if (!s) {
    throw new NotFoundError(`Serial "${id}" not found`);
  }
  const updated = await updateSerialStatus(id, body.status, body.remarks);
  return mapSerial(updated);
}

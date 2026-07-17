import { prisma } from '../../lib/prisma';
import { NotFoundError, ConflictError } from '../../common/errors/AppError';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import {
  CreateStorageLocationBody,
  StorageLocationQuery,
  UpdateStorageLocationBody,
} from './storage-location.schema';

const SELECT = {
  id: true,
  companyId: true,
  warehouseId: true,
  warehouse: {
    select: {
      name: true,
    },
  },
  zone: true,
  rack: true,
  shelf: true,
  bin: true,
  barcode: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export async function listStorageLocations(query: StorageLocationQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const where = {
    ...filterBuilder(query.q, ['zone', 'rack', 'shelf', 'bin', 'barcode']),
    ...(query.companyId && { companyId: query.companyId }),
    ...(query.warehouseId && { warehouseId: query.warehouseId }),
  };

  const [locations, total] = await prisma.$transaction([
    prisma.storageLocation.findMany({ where, select: SELECT, orderBy, skip, take }),
    prisma.storageLocation.count({ where }),
  ]);

  const mapped = locations.map((loc) => ({
    id: loc.id,
    companyId: loc.companyId,
    warehouseId: loc.warehouseId,
    warehouseName: loc.warehouse.name,
    zone: loc.zone,
    rack: loc.rack,
    shelf: loc.shelf,
    bin: loc.bin,
    barcode: loc.barcode,
    status: loc.status,
    createdAt: loc.createdAt,
    updatedAt: loc.updatedAt,
  }));

  return { locations: mapped, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function findStorageLocationById(id: string) {
  const loc = await prisma.storageLocation.findUnique({
    where: { id },
    select: SELECT,
  });
  if (!loc) {
    throw new NotFoundError('Storage Location not found');
  }
  return {
    id: loc.id,
    companyId: loc.companyId,
    warehouseId: loc.warehouseId,
    warehouseName: loc.warehouse.name,
    zone: loc.zone,
    rack: loc.rack,
    shelf: loc.shelf,
    bin: loc.bin,
    barcode: loc.barcode,
    status: loc.status,
    createdAt: loc.createdAt,
    updatedAt: loc.updatedAt,
  };
}

export async function createStorageLocation(body: CreateStorageLocationBody) {
  const wh = await prisma.warehouse.findUnique({ where: { id: body.warehouseId } });
  if (!wh) {
    throw new NotFoundError(`Warehouse with ID "${body.warehouseId}" not found`);
  }

  // Check unique barcode
  const existing = await prisma.storageLocation.findUnique({ where: { barcode: body.barcode } });
  if (existing) {
    throw new ConflictError(`Storage location with barcode "${body.barcode}" already exists`);
  }

  const created = await prisma.storageLocation.create({
    data: {
      companyId: body.companyId,
      warehouseId: body.warehouseId,
      zone: body.zone,
      rack: body.rack,
      shelf: body.shelf,
      bin: body.bin,
      barcode: body.barcode,
      status: body.status,
    },
    select: SELECT,
  });

  return {
    id: created.id,
    companyId: created.companyId,
    warehouseId: created.warehouseId,
    warehouseName: created.warehouse.name,
    zone: created.zone,
    rack: created.rack,
    shelf: created.shelf,
    bin: created.bin,
    barcode: created.barcode,
    status: created.status,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };
}

export async function updateStorageLocation(id: string, body: UpdateStorageLocationBody) {
  await findStorageLocationById(id);
  const data: Record<string, unknown> = {};
  if (body.warehouseId !== undefined) {
    const wh = await prisma.warehouse.findUnique({ where: { id: body.warehouseId } });
    if (!wh) {
      throw new NotFoundError(`Warehouse with ID "${body.warehouseId}" not found`);
    }
    data.warehouseId = body.warehouseId;
  }
  if (body.zone !== undefined) {
    data.zone = body.zone;
  }
  if (body.rack !== undefined) {
    data.rack = body.rack;
  }
  if (body.shelf !== undefined) {
    data.shelf = body.shelf;
  }
  if (body.bin !== undefined) {
    data.bin = body.bin;
  }
  if (body.barcode !== undefined) {
    const existing = await prisma.storageLocation.findUnique({ where: { barcode: body.barcode } });
    if (existing && existing.id !== id) {
      throw new ConflictError(`Storage location with barcode "${body.barcode}" already exists`);
    }
    data.barcode = body.barcode;
  }
  if (body.status !== undefined) {
    data.status = body.status;
  }

  const updated = await prisma.storageLocation.update({ where: { id }, data, select: SELECT });

  return {
    id: updated.id,
    companyId: updated.companyId,
    warehouseId: updated.warehouseId,
    warehouseName: updated.warehouse.name,
    zone: updated.zone,
    rack: updated.rack,
    shelf: updated.shelf,
    bin: updated.bin,
    barcode: updated.barcode,
    status: updated.status,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

export async function deleteStorageLocation(id: string) {
  await findStorageLocationById(id);
  await prisma.storageLocation.delete({ where: { id } });
}

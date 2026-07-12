// ─────────────────────────────────────────────
// Warehouse Module — Repository
// ─────────────────────────────────────────────

import { Prisma, WarehouseStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { WarehouseListOptions } from './warehouse.types';
import { CreateWarehouseBody, UpdateWarehouseBody } from './warehouse.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaWarehouseRaw } from './warehouse.mapper';

// ── Select shape ───────────────────────────────────────────────────────────────

const WAREHOUSE_SELECT = {
  id: true,
  companyId: true,
  branchId: true,
  code: true,
  name: true,
  phone: true,
  email: true,
  managerName: true,
  country: true,
  city: true,
  address: true,
  status: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.WarehouseSelect;

// ── List ───────────────────────────────────────────────────────────────────────

export async function findWarehouses(options: WarehouseListOptions): Promise<{
  warehouses: PrismaWarehouseRaw[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: options.page ?? 1, limit: options.limit ?? 20 });

  const where: Prisma.WarehouseWhereInput = {
    deletedAt: null,
    ...(options.companyId ? { companyId: options.companyId } : {}),
    ...(options.branchId ? { branchId: options.branchId } : {}),
    ...(options.status ? { status: options.status } : {}),
    ...(options.q
      ? {
          OR: [
            { name: { contains: options.q, mode: 'insensitive' } },
            { code: { contains: options.q, mode: 'insensitive' } },
            { city: { contains: options.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const allowedSort: Record<string, true> = { name: true, code: true, createdAt: true };
  const sortField =
    options.sortBy !== undefined && allowedSort[options.sortBy] ? options.sortBy : 'createdAt';
  const orderBy: Prisma.WarehouseOrderByWithRelationInput = {
    [sortField]: options.sortOrder ?? 'asc',
  };

  const [warehouses, total] = await prisma.$transaction([
    prisma.warehouse.findMany({ where, select: WAREHOUSE_SELECT, orderBy, skip, take }),
    prisma.warehouse.count({ where }),
  ]);

  return {
    warehouses: warehouses,
    meta: buildPaginationMeta(options.page ?? 1, options.limit ?? 20, total),
  };
}

// ── Find by ID ─────────────────────────────────────────────────────────────────

export async function findWarehouseById(id: string): Promise<PrismaWarehouseRaw | null> {
  return prisma.warehouse.findFirst({
    where: { id, deletedAt: null },
    select: WAREHOUSE_SELECT,
  });
}

// ── Find by code ───────────────────────────────────────────────────────────────

export async function findWarehouseByCode(
  code: string,
  excludeId?: string,
): Promise<{ id: string } | null> {
  return prisma.warehouse.findFirst({
    where: { code, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
}

// ── Create ─────────────────────────────────────────────────────────────────────

export async function createWarehouse(data: CreateWarehouseBody): Promise<PrismaWarehouseRaw> {
  // If isDefault=true, clear all existing defaults in the same company
  if (data.isDefault) {
    await prisma.warehouse.updateMany({
      where: { companyId: data.companyId, isDefault: true, deletedAt: null },
      data: { isDefault: false },
    });
  }

  const warehouse = await prisma.warehouse.create({
    data: {
      companyId: data.companyId,
      ...(data.branchId ? { branchId: data.branchId } : {}),
      code: data.code,
      name: data.name,
      ...(data.phone !== null && data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.email !== null && data.email !== undefined ? { email: data.email } : {}),
      ...(data.managerName !== null && data.managerName !== undefined
        ? { managerName: data.managerName }
        : {}),
      ...(data.country !== null && data.country !== undefined ? { country: data.country } : {}),
      ...(data.city !== null && data.city !== undefined ? { city: data.city } : {}),
      ...(data.address !== null && data.address !== undefined ? { address: data.address } : {}),
      status: data.status,
      isDefault: data.isDefault,
    },
    select: WAREHOUSE_SELECT,
  });
  return warehouse;
}

// ── Update ─────────────────────────────────────────────────────────────────────

export async function updateWarehouse(
  id: string,
  companyId: string,
  data: UpdateWarehouseBody,
): Promise<PrismaWarehouseRaw> {
  const updateData: Prisma.WarehouseUpdateInput = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.phone !== undefined) {
    updateData.phone = data.phone;
  }
  if (data.email !== undefined) {
    updateData.email = data.email;
  }
  if (data.managerName !== undefined) {
    updateData.managerName = data.managerName;
  }
  if (data.country !== undefined) {
    updateData.country = data.country;
  }
  if (data.city !== undefined) {
    updateData.city = data.city;
  }
  if (data.address !== undefined) {
    updateData.address = data.address;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.isDefault === true) {
    // Clear existing defaults in the same company before setting this one
    await prisma.warehouse.updateMany({
      where: { companyId, isDefault: true, deletedAt: null, id: { not: id } },
      data: { isDefault: false },
    });
    updateData.isDefault = true;
  } else if (data.isDefault === false) {
    updateData.isDefault = false;
  }

  const warehouse = await prisma.warehouse.update({
    where: { id },
    data: updateData,
    select: WAREHOUSE_SELECT,
  });
  return warehouse;
}

// ── Soft Delete ────────────────────────────────────────────────────────────────

export async function softDeleteWarehouse(id: string): Promise<void> {
  await prisma.warehouse.update({
    where: { id },
    data: { deletedAt: new Date(), status: WarehouseStatus.INACTIVE },
  });
}

// ── Count inventory for a warehouse (guard before delete) ──────────────────────

export async function countWarehouseInventory(warehouseId: string): Promise<number> {
  return prisma.inventory.count({ where: { warehouseId } });
}

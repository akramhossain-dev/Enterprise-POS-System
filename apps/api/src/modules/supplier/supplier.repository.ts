// ─────────────────────────────────────────────
// Supplier Module — Repository
// All Prisma DB access is isolated here.
// ─────────────────────────────────────────────

import { Prisma, SupplierStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { SupplierListOptions } from './supplier.types';
import { CreateSupplierBody, UpdateSupplierBody, CreateAddressBody } from './supplier.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaSupplierWithAddresses } from './supplier.mapper';

// ── Shared Prisma select shapes ────────────────────────────────────────────────

const ADDRESS_SELECT = {
  id: true,
  supplierId: true,
  label: true,
  country: true,
  state: true,
  city: true,
  area: true,
  postalCode: true,
  addressLine1: true,
  addressLine2: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SupplierAddressSelect;

const SUPPLIER_SELECT = {
  id: true,
  companyId: true,
  supplierCode: true,
  companyName: true,
  contactPerson: true,
  email: true,
  phone: true,
  alternativePhone: true,
  website: true,
  taxNumber: true,
  creditLimit: true,
  openingBalance: true,
  currentBalance: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  addresses: { select: ADDRESS_SELECT },
} satisfies Prisma.SupplierSelect;

// ── List / Search / Filter ─────────────────────────────────────────────────────

export async function findSuppliers(options: SupplierListOptions): Promise<{
  suppliers: PrismaSupplierWithAddresses[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: options.page ?? 1, limit: options.limit ?? 20 });

  const where: Prisma.SupplierWhereInput = {
    deletedAt: null,
    ...(options.companyId ? { companyId: options.companyId } : {}),
    ...(options.status ? { status: options.status } : {}),
    ...(options.dateFrom !== undefined || options.dateTo !== undefined
      ? {
          createdAt: {
            ...(options.dateFrom !== undefined ? { gte: new Date(options.dateFrom) } : {}),
            ...(options.dateTo !== undefined ? { lte: new Date(options.dateTo) } : {}),
          },
        }
      : {}),
    ...(options.q
      ? {
          OR: [
            { companyName: { contains: options.q, mode: 'insensitive' } },
            { contactPerson: { contains: options.q, mode: 'insensitive' } },
            { phone: { contains: options.q, mode: 'insensitive' } },
            { email: { contains: options.q, mode: 'insensitive' } },
            { supplierCode: { contains: options.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const allowedSort: Record<string, true> = {
    companyName: true,
    createdAt: true,
    currentBalance: true,
  };
  const sortField =
    options.sortBy !== undefined && allowedSort[options.sortBy] ? options.sortBy : 'createdAt';
  const orderBy: Prisma.SupplierOrderByWithRelationInput = {
    [sortField]: options.sortOrder ?? 'desc',
  };

  const [suppliers, total] = await prisma.$transaction([
    prisma.supplier.findMany({ where, select: SUPPLIER_SELECT, orderBy, skip, take }),
    prisma.supplier.count({ where }),
  ]);

  return {
    suppliers: suppliers as unknown as PrismaSupplierWithAddresses[],
    meta: buildPaginationMeta(options.page ?? 1, options.limit ?? 20, total),
  };
}

// ── Find by ID ─────────────────────────────────────────────────────────────────

export async function findSupplierById(id: string): Promise<PrismaSupplierWithAddresses | null> {
  const supplier = await prisma.supplier.findFirst({
    where: { id, deletedAt: null },
    select: SUPPLIER_SELECT,
  });
  return supplier;
}

// ── Duplicate checks ───────────────────────────────────────────────────────────

export async function findSupplierByEmail(
  email: string,
  excludeId?: string,
): Promise<{ id: string } | null> {
  return prisma.supplier.findFirst({
    where: { email, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
}

export async function findSupplierByPhone(
  phone: string,
  excludeId?: string,
): Promise<{ id: string } | null> {
  return prisma.supplier.findFirst({
    where: { phone, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
}

// ── Generate next supplier code ────────────────────────────────────────────────

export async function generateSupplierCode(): Promise<string> {
  const count = await prisma.supplier.count();
  const next = count + 1;
  return `SUP-${String(next).padStart(6, '0')}`;
}

// ── Create ─────────────────────────────────────────────────────────────────────

export async function createSupplier(
  data: CreateSupplierBody,
  supplierCode: string,
): Promise<PrismaSupplierWithAddresses> {
  const supplier = await prisma.supplier.create({
    data: {
      companyId: data.companyId,
      supplierCode,
      companyName: data.companyName,
      ...(data.contactPerson !== undefined ? { contactPerson: data.contactPerson } : {}),
      ...(data.email !== null && data.email !== undefined ? { email: data.email } : {}),
      ...(data.phone !== null && data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.alternativePhone !== null && data.alternativePhone !== undefined
        ? { alternativePhone: data.alternativePhone }
        : {}),
      ...(data.website !== null && data.website !== undefined ? { website: data.website } : {}),
      ...(data.taxNumber !== null && data.taxNumber !== undefined
        ? { taxNumber: data.taxNumber }
        : {}),
      creditLimit: data.creditLimit,
      openingBalance: data.openingBalance,
      currentBalance: data.openingBalance,
      status: data.status,
      ...(data.notes !== null && data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.addresses.length > 0
        ? {
            addresses: {
              create: data.addresses.map((addr) => ({
                label: addr.label,
                ...(addr.country !== undefined ? { country: addr.country } : {}),
                ...(addr.state !== undefined ? { state: addr.state } : {}),
                ...(addr.city !== undefined ? { city: addr.city } : {}),
                ...(addr.area !== undefined ? { area: addr.area } : {}),
                ...(addr.postalCode !== undefined ? { postalCode: addr.postalCode } : {}),
                addressLine1: addr.addressLine1,
                ...(addr.addressLine2 !== undefined ? { addressLine2: addr.addressLine2 } : {}),
                isDefault: addr.isDefault,
              })),
            },
          }
        : {}),
    },
    select: SUPPLIER_SELECT,
  });

  return supplier;
}

// ── Update ─────────────────────────────────────────────────────────────────────

export async function updateSupplier(
  id: string,
  data: UpdateSupplierBody,
): Promise<PrismaSupplierWithAddresses> {
  const updateData: Prisma.SupplierUpdateInput = {};

  if (data.companyName !== undefined) {
    updateData.companyName = data.companyName;
  }
  if (data.contactPerson !== undefined) {
    updateData.contactPerson = data.contactPerson;
  }
  if (data.email !== undefined) {
    updateData.email = data.email;
  }
  if (data.phone !== undefined) {
    updateData.phone = data.phone;
  }
  if (data.alternativePhone !== undefined) {
    updateData.alternativePhone = data.alternativePhone;
  }
  if (data.website !== undefined) {
    updateData.website = data.website;
  }
  if (data.taxNumber !== undefined) {
    updateData.taxNumber = data.taxNumber;
  }
  if (data.creditLimit !== undefined) {
    updateData.creditLimit = data.creditLimit;
  }
  if (data.openingBalance !== undefined) {
    updateData.openingBalance = data.openingBalance;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  const supplier = await prisma.supplier.update({
    where: { id },
    data: updateData,
    select: SUPPLIER_SELECT,
  });

  return supplier;
}

// ── Soft Delete ────────────────────────────────────────────────────────────────

export async function softDeleteSupplier(id: string): Promise<void> {
  await prisma.supplier.update({
    where: { id },
    data: { deletedAt: new Date(), status: SupplierStatus.INACTIVE },
  });
}

// ── Address operations ─────────────────────────────────────────────────────────

export async function addSupplierAddress(supplierId: string, data: CreateAddressBody) {
  if (data.isDefault) {
    await prisma.supplierAddress.updateMany({
      where: { supplierId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.supplierAddress.create({
    data: {
      supplierId,
      label: data.label,
      ...(data.country !== undefined ? { country: data.country } : {}),
      ...(data.state !== undefined ? { state: data.state } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.area !== undefined ? { area: data.area } : {}),
      ...(data.postalCode !== undefined ? { postalCode: data.postalCode } : {}),
      addressLine1: data.addressLine1,
      ...(data.addressLine2 !== undefined ? { addressLine2: data.addressLine2 } : {}),
      isDefault: data.isDefault,
    },
    select: ADDRESS_SELECT,
  });
}

export async function findSupplierAddresses(supplierId: string) {
  return prisma.supplierAddress.findMany({
    where: { supplierId },
    select: ADDRESS_SELECT,
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });
}

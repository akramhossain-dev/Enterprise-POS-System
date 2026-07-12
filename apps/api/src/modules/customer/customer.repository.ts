// ─────────────────────────────────────────────
// Customer Module — Repository
// All DB access is isolated here.
// ─────────────────────────────────────────────

import { Prisma, CustomerStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { CustomerListOptions } from './customer.types';
import { CreateCustomerBody, UpdateCustomerBody, CreateAddressBody } from './customer.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaCustomerWithAddresses } from './customer.mapper';

// ── Shared select shape for addresses ─────────────────────────────────────────

const ADDRESS_SELECT = {
  id: true,
  customerId: true,
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
} satisfies Prisma.CustomerAddressSelect;

// ── Shared select shape for customer ──────────────────────────────────────────

const CUSTOMER_SELECT = {
  id: true,
  companyId: true,
  branchId: true,
  customerCode: true,
  firstName: true,
  lastName: true,
  fullName: true,
  email: true,
  phone: true,
  alternativePhone: true,
  dateOfBirth: true,
  gender: true,
  nationalId: true,
  taxNumber: true,
  creditLimit: true,
  openingBalance: true,
  currentBalance: true,
  loyaltyPoints: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  addresses: { select: ADDRESS_SELECT },
} satisfies Prisma.CustomerSelect;

// ── List / Search / Filter ─────────────────────────────────────────────────────

export async function findCustomers(options: CustomerListOptions): Promise<{
  customers: PrismaCustomerWithAddresses[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: options.page ?? 1, limit: options.limit ?? 20 });

  const where: Prisma.CustomerWhereInput = {
    deletedAt: null,
    ...(options.companyId && { companyId: options.companyId }),
    ...(options.branchId && { branchId: options.branchId }),
    ...(options.status && { status: options.status }),
    ...(options.dateFrom || options.dateTo
      ? {
          createdAt: {
            ...(options.dateFrom && { gte: new Date(options.dateFrom) }),
            ...(options.dateTo && { lte: new Date(options.dateTo) }),
          },
        }
      : {}),
    ...(options.q
      ? {
          OR: [
            { fullName: { contains: options.q, mode: 'insensitive' } },
            { phone: { contains: options.q, mode: 'insensitive' } },
            { email: { contains: options.q, mode: 'insensitive' } },
            { customerCode: { contains: options.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const allowedSortFields: Record<string, true> = {
    fullName: true,
    createdAt: true,
    currentBalance: true,
  };
  const sortField =
    options.sortBy && allowedSortFields[options.sortBy] ? options.sortBy : 'createdAt';
  const orderBy: Prisma.CustomerOrderByWithRelationInput = {
    [sortField]: options.sortOrder ?? 'desc',
  };

  const [customers, total] = await prisma.$transaction([
    prisma.customer.findMany({ where, select: CUSTOMER_SELECT, orderBy, skip, take }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers: customers as unknown as PrismaCustomerWithAddresses[],
    meta: buildPaginationMeta(options.page ?? 1, options.limit ?? 20, total),
  };
}

// ── Find by ID ─────────────────────────────────────────────────────────────────

export async function findCustomerById(id: string): Promise<PrismaCustomerWithAddresses | null> {
  const customer = await prisma.customer.findFirst({
    where: { id, deletedAt: null },
    select: CUSTOMER_SELECT,
  });
  return customer;
}

// ── Duplicate checks ───────────────────────────────────────────────────────────

export async function findCustomerByEmail(
  email: string,
  excludeId?: string,
): Promise<{ id: string } | null> {
  return prisma.customer.findFirst({
    where: { email, deletedAt: null, ...(excludeId && { id: { not: excludeId } }) },
    select: { id: true },
  });
}

export async function findCustomerByPhone(
  phone: string,
  excludeId?: string,
): Promise<{ id: string } | null> {
  return prisma.customer.findFirst({
    where: { phone, deletedAt: null, ...(excludeId && { id: { not: excludeId } }) },
    select: { id: true },
  });
}

// ── Generate next customer code ────────────────────────────────────────────────

export async function generateCustomerCode(): Promise<string> {
  const count = await prisma.customer.count();
  const next = count + 1;
  return `CUS-${String(next).padStart(6, '0')}`;
}

// ── Create ─────────────────────────────────────────────────────────────────────

export async function createCustomer(
  data: CreateCustomerBody,
  customerCode: string,
): Promise<PrismaCustomerWithAddresses> {
  const fullName = `${data.firstName} ${data.lastName}`.trim();

  const customer = await prisma.customer.create({
    data: {
      companyId: data.companyId,
      ...(data.branchId ? { branchId: data.branchId } : {}),
      customerCode,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName,
      ...(data.email !== null && data.email !== undefined ? { email: data.email } : {}),
      ...(data.phone !== null && data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.alternativePhone !== null && data.alternativePhone !== undefined
        ? { alternativePhone: data.alternativePhone }
        : {}),
      ...(data.dateOfBirth !== null && data.dateOfBirth !== undefined
        ? { dateOfBirth: data.dateOfBirth }
        : {}),
      ...(data.gender !== null && data.gender !== undefined ? { gender: data.gender } : {}),
      ...(data.nationalId !== null && data.nationalId !== undefined
        ? { nationalId: data.nationalId }
        : {}),
      ...(data.taxNumber !== null && data.taxNumber !== undefined
        ? { taxNumber: data.taxNumber }
        : {}),
      creditLimit: data.creditLimit,
      openingBalance: data.openingBalance,
      currentBalance: data.openingBalance,
      loyaltyPoints: 0,
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
    select: CUSTOMER_SELECT,
  });

  return customer;
}

// ── Update ─────────────────────────────────────────────────────────────────────

export async function updateCustomer(
  id: string,
  data: UpdateCustomerBody,
): Promise<PrismaCustomerWithAddresses> {
  const updateData: Prisma.CustomerUpdateInput = {};

  if (data.firstName !== undefined) {
    updateData.firstName = data.firstName;
  }
  if (data.lastName !== undefined) {
    updateData.lastName = data.lastName;
  }

  if (data.firstName !== undefined || data.lastName !== undefined) {
    const existing = await prisma.customer.findUnique({
      where: { id },
      select: { firstName: true, lastName: true },
    });
    const firstName = data.firstName ?? existing?.firstName ?? '';
    const lastName = data.lastName ?? existing?.lastName ?? '';
    updateData.fullName = `${firstName} ${lastName}`.trim();
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
  if (data.dateOfBirth !== undefined) {
    updateData.dateOfBirth = data.dateOfBirth;
  }
  if (data.gender !== undefined) {
    updateData.gender = data.gender;
  }
  if (data.nationalId !== undefined) {
    updateData.nationalId = data.nationalId;
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
  if (data.branchId !== undefined) {
    updateData.branch = data.branchId ? { connect: { id: data.branchId } } : { disconnect: true };
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: updateData,
    select: CUSTOMER_SELECT,
  });

  return customer;
}

// ── Soft Delete ────────────────────────────────────────────────────────────────

export async function softDeleteCustomer(id: string): Promise<void> {
  await prisma.customer.update({
    where: { id },
    data: { deletedAt: new Date(), status: CustomerStatus.INACTIVE },
  });
}

// ── Address operations ─────────────────────────────────────────────────────────

export async function addCustomerAddress(customerId: string, data: CreateAddressBody) {
  if (data.isDefault) {
    await prisma.customerAddress.updateMany({
      where: { customerId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.customerAddress.create({
    data: {
      customerId,
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

export async function findCustomerAddresses(customerId: string) {
  return prisma.customerAddress.findMany({
    where: { customerId },
    select: ADDRESS_SELECT,
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });
}

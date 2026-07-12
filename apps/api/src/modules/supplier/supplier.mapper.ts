// ─────────────────────────────────────────────
// Supplier Module — Mapper
// Maps raw Prisma records to clean API response shapes
// ─────────────────────────────────────────────

import {
  Supplier as PrismaSupplier,
  SupplierAddress as PrismaSupplierAddress,
} from '@prisma/client';

export type PrismaSupplierAddressRaw = PrismaSupplierAddress;
export type PrismaSupplierWithAddresses = PrismaSupplier & {
  addresses: PrismaSupplierAddressRaw[];
};

// ── Mapped shapes ──────────────────────────────────────────────────────────────

export interface MappedSupplierAddress {
  id: string;
  supplierId: string;
  label: string;
  country: string | null;
  state: string | null;
  city: string | null;
  area: string | null;
  postalCode: string | null;
  addressLine1: string;
  addressLine2: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MappedSupplier {
  id: string;
  companyId: string;
  supplierCode: string;
  companyName: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  alternativePhone: string | null;
  website: string | null;
  taxNumber: string | null;
  creditLimit: string;
  openingBalance: string;
  currentBalance: string;
  status: string;
  notes: string | null;
  addresses: MappedSupplierAddress[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ── Mapper functions ───────────────────────────────────────────────────────────

export function mapAddress(addr: PrismaSupplierAddressRaw): MappedSupplierAddress {
  return {
    id: addr.id,
    supplierId: addr.supplierId,
    label: addr.label,
    country: addr.country,
    state: addr.state,
    city: addr.city,
    area: addr.area,
    postalCode: addr.postalCode,
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    isDefault: addr.isDefault,
    createdAt: addr.createdAt.toISOString(),
    updatedAt: addr.updatedAt.toISOString(),
  };
}

export function mapSupplier(supplier: PrismaSupplierWithAddresses): MappedSupplier {
  return {
    id: supplier.id,
    companyId: supplier.companyId,
    supplierCode: supplier.supplierCode,
    companyName: supplier.companyName,
    contactPerson: supplier.contactPerson,
    email: supplier.email,
    phone: supplier.phone,
    alternativePhone: supplier.alternativePhone,
    website: supplier.website,
    taxNumber: supplier.taxNumber,
    creditLimit: supplier.creditLimit.toString(),
    openingBalance: supplier.openingBalance.toString(),
    currentBalance: supplier.currentBalance.toString(),
    status: supplier.status,
    notes: supplier.notes,
    addresses: supplier.addresses.map(mapAddress),
    createdAt: supplier.createdAt.toISOString(),
    updatedAt: supplier.updatedAt.toISOString(),
    deletedAt: supplier.deletedAt ? supplier.deletedAt.toISOString() : null,
  };
}

export function mapSupplierList(suppliers: PrismaSupplierWithAddresses[]): MappedSupplier[] {
  return suppliers.map(mapSupplier);
}

// ─────────────────────────────────────────────
// Supplier Module — Zod Schemas & Types
// ─────────────────────────────────────────────

import { z } from 'zod';
import { SupplierStatus } from '@prisma/client';

// ── Shared address sub-schema ──────────────────────────────────────────────────

const addressSchema = z
  .object({
    label: z.string().min(1, 'Label is required').max(100),
    country: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    area: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    addressLine1: z.string().min(1, 'Address line 1 is required').max(255),
    addressLine2: z.string().max(255).optional(),
    isDefault: z.boolean().optional(),
  })
  .transform((a) => ({ ...a, isDefault: a.isDefault === true }));

// ── Create Supplier ────────────────────────────────────────────────────────────

export const createSupplierSchema = z
  .object({
    companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),

    companyName: z
      .string()
      .min(1, 'Company name is required')
      .max(255, 'Company name cannot exceed 255 characters'),

    contactPerson: z.string().max(200).optional(),

    email: z.string().email('Invalid email address').max(255).optional().nullable(),
    phone: z.string().min(1).max(50).optional().nullable(),
    alternativePhone: z.string().max(50).optional().nullable(),

    website: z.string().url('Invalid website URL').max(255).optional().nullable(),

    taxNumber: z.string().max(100).optional().nullable(),

    creditLimit: z.coerce
      .number({ invalid_type_error: 'Credit limit must be a number' })
      .min(0, 'Credit limit cannot be negative')
      .optional(),

    openingBalance: z.coerce
      .number({ invalid_type_error: 'Opening balance must be a number' })
      .optional(),

    status: z.nativeEnum(SupplierStatus).optional(),
    notes: z.string().max(2000).optional().nullable(),

    addresses: z.array(addressSchema).optional(),
  })
  .transform((data) => ({
    ...data,
    creditLimit: data.creditLimit ?? 0,
    openingBalance: data.openingBalance ?? 0,
    status: data.status ?? SupplierStatus.ACTIVE,
    addresses: data.addresses ?? [],
  }));

export type CreateSupplierBody = z.infer<typeof createSupplierSchema>;

// ── Update Supplier ────────────────────────────────────────────────────────────

export const updateSupplierSchema = z.object({
  companyName: z.string().min(1).max(255).optional(),
  contactPerson: z.string().max(200).optional().nullable(),

  email: z.string().email('Invalid email address').max(255).optional().nullable(),
  phone: z.string().min(1).max(50).optional().nullable(),
  alternativePhone: z.string().max(50).optional().nullable(),

  website: z.string().url('Invalid website URL').max(255).optional().nullable(),
  taxNumber: z.string().max(100).optional().nullable(),

  creditLimit: z.coerce
    .number({ invalid_type_error: 'Credit limit must be a number' })
    .min(0, 'Credit limit cannot be negative')
    .optional(),

  openingBalance: z.coerce
    .number({ invalid_type_error: 'Opening balance must be a number' })
    .optional(),

  status: z.nativeEnum(SupplierStatus).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export type UpdateSupplierBody = z.infer<typeof updateSupplierSchema>;

// ── Supplier Query ─────────────────────────────────────────────────────────────

export const supplierQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    q: z.string().optional(),
    companyId: z.string().uuid().optional(),
    status: z.nativeEnum(SupplierStatus).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.enum(['companyName', 'createdAt', 'currentBalance']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((data) => ({
    ...data,
    page: data.page ?? 1,
    limit: data.limit ?? 20,
  }));

export type SupplierQuery = z.infer<typeof supplierQuerySchema>;

// ── Address schemas (standalone) ───────────────────────────────────────────────

export const createAddressSchema = z
  .object({
    label: z.string().min(1, 'Label is required').max(100),
    country: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    area: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    addressLine1: z.string().min(1, 'Address line 1 is required').max(255),
    addressLine2: z.string().max(255).optional(),
    isDefault: z.boolean().optional(),
  })
  .transform((data) => ({
    ...data,
    isDefault: data.isDefault === true,
  }));

export type CreateAddressBody = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  country: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  area: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  addressLine1: z.string().min(1).max(255).optional(),
  addressLine2: z.string().max(255).optional().nullable(),
  isDefault: z.boolean().optional(),
});
export type UpdateAddressBody = z.infer<typeof updateAddressSchema>;

// ── Supplier Ledger Query (B8.3) ──────────────────────────────────────────────

export const supplierLedgerQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    entryType: z.enum(['PURCHASE', 'PURCHASE_RETURN', 'PAYMENT']).optional(),
    dateFrom: z.string().datetime({ offset: true }).optional(),
    dateTo: z.string().datetime({ offset: true }).optional(),
  })
  .transform((d) => ({
    ...d,
    page: d.page ?? 1,
    limit: d.limit ?? 20,
    dateFrom: d.dateFrom ? new Date(d.dateFrom) : undefined,
    dateTo: d.dateTo ? new Date(d.dateTo) : undefined,
  }));

export type SupplierLedgerQuery = z.infer<typeof supplierLedgerQuerySchema>;

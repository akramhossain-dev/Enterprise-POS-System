// ─────────────────────────────────────────────
// Customer Module — Zod Schemas & Types
// ─────────────────────────────────────────────

import { z } from 'zod';
import { CustomerStatus, Gender } from '@prisma/client';

// ── Create Customer ────────────────────────────────────────────────────────────

export const createCustomerSchema = z
  .object({
    companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
    branchId: z.string().uuid({ message: 'branchId must be a valid UUID' }).optional(),

    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name cannot exceed 100 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name cannot exceed 100 characters'),

    email: z.string().email('Invalid email address').max(255).optional().nullable(),
    phone: z
      .string()
      .min(1, 'Phone is required')
      .max(50, 'Phone cannot exceed 50 characters')
      .optional()
      .nullable(),
    alternativePhone: z.string().max(50).optional().nullable(),

    dateOfBirth: z.coerce.date().optional().nullable(),
    gender: z.nativeEnum(Gender).optional().nullable(),
    nationalId: z.string().max(100).optional().nullable(),
    taxNumber: z.string().max(100).optional().nullable(),

    creditLimit: z.coerce
      .number({ invalid_type_error: 'Credit limit must be a number' })
      .min(0, 'Credit limit cannot be negative')
      .optional(),

    openingBalance: z.coerce
      .number({ invalid_type_error: 'Opening balance must be a number' })
      .optional(),

    status: z.nativeEnum(CustomerStatus).optional(),
    notes: z.string().max(2000).optional().nullable(),

    addresses: z
      .array(
        z
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
          .transform((a) => ({ ...a, isDefault: a.isDefault === true })),
      )
      .optional(),
  })
  .transform((data) => ({
    ...data,
    creditLimit: data.creditLimit ?? 0,
    openingBalance: data.openingBalance ?? 0,
    status: data.status ?? CustomerStatus.ACTIVE,
    addresses: data.addresses ?? [],
  }));

export type CreateCustomerBody = z.infer<typeof createCustomerSchema>;

// ── Update Customer ────────────────────────────────────────────────────────────

export const updateCustomerSchema = z.object({
  branchId: z.string().uuid({ message: 'branchId must be a valid UUID' }).optional().nullable(),

  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),

  email: z.string().email('Invalid email address').max(255).optional().nullable(),
  phone: z.string().min(1).max(50).optional().nullable(),
  alternativePhone: z.string().max(50).optional().nullable(),

  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  nationalId: z.string().max(100).optional().nullable(),
  taxNumber: z.string().max(100).optional().nullable(),

  creditLimit: z.coerce
    .number({ invalid_type_error: 'Credit limit must be a number' })
    .min(0, 'Credit limit cannot be negative')
    .optional(),

  openingBalance: z.coerce
    .number({ invalid_type_error: 'Opening balance must be a number' })
    .optional(),

  status: z.nativeEnum(CustomerStatus).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export type UpdateCustomerBody = z.infer<typeof updateCustomerSchema>;

// ── Customer Query (list / search / filter / sort / paginate) ─────────────────

export const customerQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    q: z.string().optional(),
    companyId: z.string().uuid().optional(),
    branchId: z.string().uuid().optional(),
    status: z.nativeEnum(CustomerStatus).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.enum(['fullName', 'createdAt', 'currentBalance']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((data) => ({
    ...data,
    page: data.page ?? 1,
    limit: data.limit ?? 20,
  }));

export type CustomerQuery = z.infer<typeof customerQuerySchema>;

// ── Address Schemas ────────────────────────────────────────────────────────────

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

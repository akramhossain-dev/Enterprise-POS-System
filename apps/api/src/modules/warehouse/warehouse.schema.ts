// ─────────────────────────────────────────────
// Warehouse Module — Zod Schemas
// ─────────────────────────────────────────────

import { z } from 'zod';
import { WarehouseStatus } from '@prisma/client';

// ── Create Warehouse ───────────────────────────────────────────────────────────

export const createWarehouseSchema = z
  .object({
    companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
    branchId: z.string().uuid({ message: 'branchId must be a valid UUID' }).optional().nullable(),

    name: z
      .string()
      .min(1, 'Warehouse name is required')
      .max(255, 'Name cannot exceed 255 characters'),

    code: z
      .string()
      .min(1, 'Warehouse code is required')
      .max(20, 'Code cannot exceed 20 characters')
      .regex(/^[A-Z0-9-]+$/, 'Code must be uppercase letters, numbers, or hyphens'),

    phone: z.string().max(50).optional().nullable(),
    email: z.string().email('Invalid email').max(255).optional().nullable(),
    managerName: z.string().max(200).optional().nullable(),
    country: z.string().max(100).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    address: z.string().max(500).optional().nullable(),

    status: z.nativeEnum(WarehouseStatus).optional(),
    isDefault: z.boolean().optional(),
  })
  .transform((data) => ({
    ...data,
    status: data.status ?? WarehouseStatus.ACTIVE,
    isDefault: data.isDefault === true,
  }));

export type CreateWarehouseBody = z.infer<typeof createWarehouseSchema>;

// ── Update Warehouse ───────────────────────────────────────────────────────────

export const updateWarehouseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email('Invalid email').max(255).optional().nullable(),
  managerName: z.string().max(200).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  status: z.nativeEnum(WarehouseStatus).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateWarehouseBody = z.infer<typeof updateWarehouseSchema>;

// ── Query ─────────────────────────────────────────────────────────────────────

export const warehouseQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    q: z.string().optional(),
    companyId: z.string().uuid().optional(),
    branchId: z.string().uuid().optional(),
    status: z.nativeEnum(WarehouseStatus).optional(),
    sortBy: z.enum(['name', 'code', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((data) => ({
    ...data,
    page: data.page ?? 1,
    limit: data.limit ?? 20,
  }));

export type WarehouseQuery = z.infer<typeof warehouseQuerySchema>;

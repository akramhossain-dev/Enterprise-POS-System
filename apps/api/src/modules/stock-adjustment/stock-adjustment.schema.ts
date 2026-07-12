// ─────────────────────────────────────────────
// Stock Adjustment Module — Zod Schemas
// ─────────────────────────────────────────────

import { z } from 'zod';
import { AdjustmentType } from '@prisma/client';

const ADJUSTMENT_TYPE_VALUES = Object.values(AdjustmentType) as [string, ...string[]];

export const createAdjustmentSchema = z.object({
  companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
  warehouseId: z.string().uuid({ message: 'warehouseId must be a valid UUID' }),
  productId: z.string().uuid({ message: 'productId must be a valid UUID' }),
  type: z.enum(ADJUSTMENT_TYPE_VALUES as [AdjustmentType, ...AdjustmentType[]], {
    errorMap: () => ({ message: `type must be one of: ${ADJUSTMENT_TYPE_VALUES.join(', ')}` }),
  }),
  quantity: z.coerce
    .number({ invalid_type_error: 'quantity must be a number' })
    .positive({ message: 'Quantity must be greater than 0' }),
  reason: z
    .string({ required_error: 'reason is required' })
    .min(3, 'Reason must be at least 3 characters')
    .max(500),
  remarks: z.string().max(2000).optional(),
  unitCost: z.coerce.number().positive().optional(),
});

export type CreateAdjustmentBody = z.infer<typeof createAdjustmentSchema>;

export const adjustmentQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    type: z.enum(ADJUSTMENT_TYPE_VALUES as [AdjustmentType, ...AdjustmentType[]]).optional(),
    createdBy: z.string().uuid().optional(),
    dateFrom: z.string().datetime({ offset: true }).optional(),
    dateTo: z.string().datetime({ offset: true }).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((data) => ({
    ...data,
    page: data.page ?? 1,
    limit: data.limit ?? 20,
    dateFrom: data.dateFrom ? new Date(data.dateFrom) : undefined,
    dateTo: data.dateTo ? new Date(data.dateTo) : undefined,
  }));

export type AdjustmentQuery = z.infer<typeof adjustmentQuerySchema>;

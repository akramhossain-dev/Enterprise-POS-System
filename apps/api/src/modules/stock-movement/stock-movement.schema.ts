// ─────────────────────────────────────────────
// Stock Movement Module — Zod Schemas
// ─────────────────────────────────────────────

import { z } from 'zod';
import { MovementType } from '@prisma/client';

const MOVEMENT_TYPE_VALUES = Object.values(MovementType) as [string, ...string[]];

export const stockMovementQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    movementType: z.enum(MOVEMENT_TYPE_VALUES as [MovementType, ...MovementType[]]).optional(),
    referenceType: z.string().max(50).optional(),
    referenceId: z.string().uuid().optional(),
    performedBy: z.string().uuid().optional(),
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

export type StockMovementQuery = z.infer<typeof stockMovementQuerySchema>;

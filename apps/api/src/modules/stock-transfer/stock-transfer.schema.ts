// ─────────────────────────────────────────────
// Stock Transfer Module — Zod Schemas
// ─────────────────────────────────────────────

import { z } from 'zod';
import { TransferStatus } from '@prisma/client';

// ── Transfer Item ──────────────────────────────────────────────────────────────

const transferItemSchema = z.object({
  productId: z.string().uuid({ message: 'productId must be a valid UUID' }),
  quantity: z.coerce
    .number({ invalid_type_error: 'quantity must be a number' })
    .positive({ message: 'Quantity must be greater than 0' }),
});

// ── Create Transfer ────────────────────────────────────────────────────────────

export const createTransferSchema = z
  .object({
    companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
    fromWarehouseId: z.string().uuid({ message: 'fromWarehouseId must be a valid UUID' }),
    toWarehouseId: z.string().uuid({ message: 'toWarehouseId must be a valid UUID' }),
    remarks: z.string().max(2000).optional(),
    items: z
      .array(transferItemSchema)
      .min(1, 'At least one item is required')
      .max(100, 'Maximum 100 items per transfer'),
  })
  .superRefine((data, ctx) => {
    if (data.fromWarehouseId === data.toWarehouseId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Source and destination warehouses must be different',
        path: ['toWarehouseId'],
      });
    }

    // Check for duplicate productIds in items
    const productIds = data.items.map((i) => i.productId);
    const uniqueIds = new Set(productIds);
    if (uniqueIds.size !== productIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duplicate products found in transfer items',
        path: ['items'],
      });
    }
  });

export type CreateTransferBody = z.infer<typeof createTransferSchema>;

// ── Transfer Query ─────────────────────────────────────────────────────────────

const TRANSFER_STATUS_VALUES = Object.values(TransferStatus) as [string, ...string[]];

export const transferQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    fromWarehouseId: z.string().uuid().optional(),
    toWarehouseId: z.string().uuid().optional(),
    status: z.enum(TRANSFER_STATUS_VALUES as [TransferStatus, ...TransferStatus[]]).optional(),
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

export type TransferQuery = z.infer<typeof transferQuerySchema>;

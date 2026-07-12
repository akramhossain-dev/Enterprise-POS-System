// ─────────────────────────────────────────────
// Inventory Module — Zod Schemas
// ─────────────────────────────────────────────

import { z } from 'zod';

// ── Opening Stock ──────────────────────────────────────────────────────────────

export const openingStockSchema = z
  .object({
    companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
    warehouseId: z.string().uuid({ message: 'warehouseId must be a valid UUID' }),
    productId: z.string().uuid({ message: 'productId must be a valid UUID' }),

    quantity: z.coerce
      .number({ invalid_type_error: 'Quantity must be a number' })
      .min(0, 'Quantity cannot be negative'),

    averageCost: z.coerce
      .number({ invalid_type_error: 'Average cost must be a number' })
      .min(0, 'Average cost cannot be negative')
      .optional(),

    minimumQuantity: z.coerce
      .number({ invalid_type_error: 'Minimum quantity must be a number' })
      .min(0, 'Minimum quantity cannot be negative')
      .optional(),

    reorderQuantity: z.coerce
      .number({ invalid_type_error: 'Reorder quantity must be a number' })
      .min(0, 'Reorder quantity cannot be negative')
      .optional(),

    maximumQuantity: z.coerce
      .number({ invalid_type_error: 'Maximum quantity must be a number' })
      .min(0, 'Maximum quantity cannot be negative')
      .optional(),
  })
  .transform((data) => ({
    ...data,
    averageCost: data.averageCost ?? 0,
    minimumQuantity: data.minimumQuantity ?? 0,
    reorderQuantity: data.reorderQuantity ?? 0,
  }))
  .superRefine((data, ctx) => {
    if (data.reorderQuantity < data.minimumQuantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Reorder quantity (${String(data.reorderQuantity)}) must be >= minimum quantity (${String(data.minimumQuantity)})`,
        path: ['reorderQuantity'],
      });
    }
  });

export type OpeningStockBody = z.infer<typeof openingStockSchema>;

// ── Update Min Stock ───────────────────────────────────────────────────────────

export const updateMinStockSchema = z
  .object({
    inventoryId: z.string().uuid({ message: 'inventoryId must be a valid UUID' }),
    minimumQuantity: z.coerce
      .number({ invalid_type_error: 'Minimum quantity must be a number' })
      .min(0, 'Minimum quantity cannot be negative'),
    reorderQuantity: z.coerce
      .number({ invalid_type_error: 'Reorder quantity must be a number' })
      .min(0, 'Reorder quantity cannot be negative')
      .optional(),
    maximumQuantity: z.coerce
      .number({ invalid_type_error: 'Maximum quantity must be a number' })
      .min(0, 'Maximum quantity cannot be negative')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.reorderQuantity !== undefined && data.reorderQuantity < data.minimumQuantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Reorder quantity must be >= minimum quantity (${String(data.minimumQuantity)})`,
        path: ['reorderQuantity'],
      });
    }
  });

export type UpdateMinStockBody = z.infer<typeof updateMinStockSchema>;

// ── Update Reorder Level ───────────────────────────────────────────────────────

export const updateReorderLevelSchema = z.object({
  inventoryId: z.string().uuid({ message: 'inventoryId must be a valid UUID' }),
  reorderQuantity: z.coerce
    .number({ invalid_type_error: 'Reorder quantity must be a number' })
    .min(0, 'Reorder quantity cannot be negative'),
});

export type UpdateReorderLevelBody = z.infer<typeof updateReorderLevelSchema>;

// ── Inventory Query ────────────────────────────────────────────────────────────

export const inventoryQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    q: z.string().optional(),
    companyId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    lowStock: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
    outOfStock: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
    sortBy: z.enum(['availableQuantity', 'updatedAt', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((data) => ({
    ...data,
    page: data.page ?? 1,
    limit: data.limit ?? 20,
  }));

export type InventoryQuery = z.infer<typeof inventoryQuerySchema>;

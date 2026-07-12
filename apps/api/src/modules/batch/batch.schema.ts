import { z } from 'zod';
import { BatchStatus } from '@prisma/client';

const STATUS_VALUES = Object.values(BatchStatus) as [BatchStatus, ...BatchStatus[]];

export const createBatchSchema = z.object({
  companyId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  productId: z.string().uuid(),
  batchNumber: z.string().min(1).max(100),
  manufacturingDate: z.string().datetime({ offset: true }).optional(),
  expiryDate: z.string().datetime({ offset: true }).optional(),
  quantity: z.coerce.number().positive(),
  remarks: z.string().max(2000).optional(),
});
export type CreateBatchBody = z.infer<typeof createBatchSchema>;

export const updateBatchStatusSchema = z.object({
  status: z.enum(STATUS_VALUES),
  remarks: z.string().max(2000).optional(),
});
export type UpdateBatchStatusBody = z.infer<typeof updateBatchStatusSchema>;

export const batchQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    status: z.enum(STATUS_VALUES).optional(),
    expiringInDays: z.coerce.number().int().positive().max(365).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((d) => ({ ...d, page: d.page ?? 1, limit: d.limit ?? 20 }));
export type BatchQuery = z.infer<typeof batchQuerySchema>;

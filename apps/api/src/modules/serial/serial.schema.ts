import { z } from 'zod';
import { SerialStatus } from '@prisma/client';

const STATUS_VALUES = Object.values(SerialStatus) as [SerialStatus, ...SerialStatus[]];

export const createSerialSchema = z.object({
  companyId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  productId: z.string().uuid(),
  serialNumber: z.string().min(1).max(200),
  remarks: z.string().max(2000).optional(),
});
export type CreateSerialBody = z.infer<typeof createSerialSchema>;

export const createSerialBulkSchema = z.object({
  companyId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  productId: z.string().uuid(),
  serialNumbers: z.array(z.string().min(1).max(200)).min(1).max(500),
});
export type CreateSerialBulkBody = z.infer<typeof createSerialBulkSchema>;

export const updateSerialStatusSchema = z.object({
  status: z.enum(STATUS_VALUES),
  remarks: z.string().max(2000).optional(),
});
export type UpdateSerialStatusBody = z.infer<typeof updateSerialStatusSchema>;

export const serialQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    status: z.enum(STATUS_VALUES).optional(),
    search: z.string().max(200).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((d) => ({ ...d, page: d.page ?? 1, limit: d.limit ?? 20 }));
export type SerialQuery = z.infer<typeof serialQuerySchema>;

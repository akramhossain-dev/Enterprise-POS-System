import { z } from 'zod';

export const storageLocationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  q: z.string().optional(),
  companyId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createStorageLocationSchema = z.object({
  companyId: z.string().uuid('companyId must be a valid UUID'),
  warehouseId: z.string().uuid('warehouseId must be a valid UUID'),
  zone: z.string().trim().min(1, 'Zone is required'),
  rack: z.string().trim().min(1, 'Rack is required'),
  shelf: z.string().trim().min(1, 'Shelf is required'),
  bin: z.string().trim().min(1, 'Bin is required'),
  barcode: z.string().trim().min(1, 'Barcode is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateStorageLocationSchema = z.object({
  warehouseId: z.string().uuid('warehouseId must be a valid UUID').optional(),
  zone: z.string().trim().min(1, 'Zone cannot be empty').optional(),
  rack: z.string().trim().min(1, 'Rack cannot be empty').optional(),
  shelf: z.string().trim().min(1, 'Shelf cannot be empty').optional(),
  bin: z.string().trim().min(1, 'Bin cannot be empty').optional(),
  barcode: z.string().trim().min(1, 'Barcode cannot be empty').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type StorageLocationQuery = z.infer<typeof storageLocationQuerySchema>;
export type CreateStorageLocationBody = z.infer<typeof createStorageLocationSchema>;
export type UpdateStorageLocationBody = z.infer<typeof updateStorageLocationSchema>;

import { z } from 'zod';

export const reportsFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),

  branchId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),

  search: z.string().optional(),

  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),

  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export interface ReportsFilter {
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  branchId?: string | undefined;
  warehouseId?: string | undefined;
  customerId?: string | undefined;
  supplierId?: string | undefined;
  productId?: string | undefined;
  search?: string | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

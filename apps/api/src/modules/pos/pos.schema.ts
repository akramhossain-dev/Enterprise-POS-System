import { z } from 'zod';

export const openSessionSchema = z.object({
  companyId: z.string().uuid('companyId must be a valid UUID'),
  branchId: z.string().uuid('branchId must be a valid UUID').optional(),
  warehouseId: z.string().uuid('warehouseId must be a valid UUID'),
  openingCash: z.coerce.number().nonnegative('openingCash cannot be negative'),
});

export type OpenSessionBody = z.infer<typeof openSessionSchema>;

export const closeSessionSchema = z.object({
  closingCash: z.coerce.number().nonnegative('closingCash cannot be negative'),
});

export type CloseSessionBody = z.infer<typeof closeSessionSchema>;

export const productSearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query q is required'),
  warehouseId: z.string().uuid('warehouseId must be a valid UUID'),
});

export type ProductSearchQuery = z.infer<typeof productSearchQuerySchema>;

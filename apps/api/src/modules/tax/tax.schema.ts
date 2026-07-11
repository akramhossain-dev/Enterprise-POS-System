import { z } from 'zod';
import { Status } from '@prisma/client';

export const taxQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.nativeEnum(Status).optional(),
  companyId: z.string().uuid().optional(),
});
export type TaxQuery = z.infer<typeof taxQuerySchema>;

export const createTaxSchema = z.object({
  companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
  name: z.string().min(1, 'Name is required').max(100),
  percentage: z
    .number({ invalid_type_error: 'Percentage must be a number' })
    .min(0, 'Percentage must be >= 0')
    .max(100, 'Percentage must be <= 100'),
});
export type CreateTaxBody = z.infer<typeof createTaxSchema>;

export const updateTaxSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  percentage: z.number().min(0).max(100).optional(),
  status: z.nativeEnum(Status).optional(),
});
export type UpdateTaxBody = z.infer<typeof updateTaxSchema>;

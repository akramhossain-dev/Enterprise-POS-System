import { z } from 'zod';
import { Status } from '@prisma/client';

export const brandQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.nativeEnum(Status).optional(),
  companyId: z.string().uuid().optional(),
});
export type BrandQuery = z.infer<typeof brandQuerySchema>;

export const createBrandSchema = z.object({
  companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(2000).optional().nullable(),
  logo: z.string().optional().nullable(),
  website: z.string().url().max(255).optional().or(z.literal('')).nullable(),
  country: z.string().max(100).optional().nullable(),
});
export type CreateBrandBody = z.infer<typeof createBrandSchema>;

export const updateBrandSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  logo: z.string().optional().nullable(),
  website: z.string().url().max(255).optional().or(z.literal('')).nullable(),
  country: z.string().max(100).optional().nullable(),
  status: z.nativeEnum(Status).optional(),
});
export type UpdateBrandBody = z.infer<typeof updateBrandSchema>;

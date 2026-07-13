import { z } from 'zod';
import { Status } from '@prisma/client';

export const categoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.nativeEnum(Status).optional(),
  companyId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional().or(z.literal('null')).nullable(),
});
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;

export const createCategorySchema = z.object({
  companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().max(255).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  image: z.string().optional().nullable(),
  icon: z.string().max(100).optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().max(2000).optional().nullable(),
});
export type CreateCategoryBody = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().max(255).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  image: z.string().optional().nullable(),
  icon: z.string().max(100).optional().nullable(),
  displayOrder: z.coerce.number().int().optional(),
  status: z.nativeEnum(Status).optional(),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().max(2000).optional().nullable(),
});
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;

import { z } from 'zod';

export const designationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  q: z.string().optional(),
  companyId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createDesignationSchema = z.object({
  companyId: z.string().uuid('companyId must be a valid UUID'),
  name: z.string().trim().min(1, 'Name is required'),
  departmentId: z.string().uuid('departmentId must be a valid UUID'),
  description: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateDesignationSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty').optional(),
  departmentId: z.string().uuid('departmentId must be a valid UUID').optional(),
  description: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type DesignationQuery = z.infer<typeof designationQuerySchema>;
export type CreateDesignationBody = z.infer<typeof createDesignationSchema>;
export type UpdateDesignationBody = z.infer<typeof updateDesignationSchema>;

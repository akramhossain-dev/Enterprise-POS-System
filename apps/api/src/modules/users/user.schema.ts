import { z } from 'zod';
import { Status } from '@prisma/client';

export const updateUserBodySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().trim().optional(),
  status: z.nativeEnum(Status).optional(),
  roleId: z.string().uuid('Invalid role ID format').optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().trim().optional(),
  sortBy: z.string().trim().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

export interface UserQuery {
  page: number;
  limit: number;
  q?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

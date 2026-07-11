import { z } from 'zod';
import { Status } from '@prisma/client';

export const unitQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.nativeEnum(Status).optional(),
  companyId: z.string().uuid().optional(),
});
export type UnitQuery = z.infer<typeof unitQuerySchema>;

export const createUnitSchema = z.object({
  companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
  name: z.string().min(1, 'Name is required').max(100),
  shortName: z.string().min(1, 'Short name is required').max(20),
});
export type CreateUnitBody = z.infer<typeof createUnitSchema>;

export const updateUnitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  shortName: z.string().min(1).max(20).optional(),
  status: z.nativeEnum(Status).optional(),
});
export type UpdateUnitBody = z.infer<typeof updateUnitSchema>;

import { z } from 'zod';
import { Status } from '@prisma/client';

// ─────────────────────────────────────────────
// Query Schema
// ─────────────────────────────────────────────

export const branchQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.nativeEnum(Status).optional(),
  companyId: z.string().uuid().optional(),
});

export type BranchQuery = z.infer<typeof branchQuerySchema>;

// ─────────────────────────────────────────────
// Create Schema
// ─────────────────────────────────────────────

export const createBranchSchema = z.object({
  companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
  name: z.string().min(1).max(255),
  address: z.string().max(1000).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
});

export type CreateBranchBody = z.infer<typeof createBranchSchema>;

// ─────────────────────────────────────────────
// Update Schema
// ─────────────────────────────────────────────

export const updateBranchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  address: z.string().max(1000).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  status: z.nativeEnum(Status).optional(),
});

export type UpdateBranchBody = z.infer<typeof updateBranchSchema>;

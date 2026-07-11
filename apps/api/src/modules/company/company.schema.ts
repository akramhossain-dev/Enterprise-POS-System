import { z } from 'zod';
import { Status } from '@prisma/client';

// ─────────────────────────────────────────────
// Query Schema
// ─────────────────────────────────────────────

export const companyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CompanyQuery = z.infer<typeof companyQuerySchema>;

// ─────────────────────────────────────────────
// Create Schema
// ─────────────────────────────────────────────

export const createCompanySchema = z.object({
  name: z.string().min(1).max(255),
  logoUrl: z.string().url().optional(),
  address: z.string().max(1000).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  taxNumber: z.string().max(100).optional(),
  currency: z.string().length(3).default('USD'),
  fiscalYearStart: z.string().date().optional(), // ISO date string YYYY-MM-DD
});

export type CreateCompanyBody = z.infer<typeof createCompanySchema>;

// ─────────────────────────────────────────────
// Update Schema
// ─────────────────────────────────────────────

export const updateCompanySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  logoUrl: z.string().url().optional(),
  address: z.string().max(1000).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  taxNumber: z.string().max(100).optional(),
  currency: z.string().length(3).optional(),
  fiscalYearStart: z.string().date().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type UpdateCompanyBody = z.infer<typeof updateCompanySchema>;

import { z } from 'zod';
import { EmployeeStatus } from '@prisma/client';

// ─────────────────────────────────────────────
// Query Schema
// ─────────────────────────────────────────────

export const employeeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.nativeEnum(EmployeeStatus).optional(),
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
});

export type EmployeeQuery = z.infer<typeof employeeQuerySchema>;

// ─────────────────────────────────────────────
// Create Schema
// ─────────────────────────────────────────────

export const createEmployeeSchema = z.object({
  companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
  branchId: z.string().uuid({ message: 'branchId must be a valid UUID' }),
  userId: z.string().uuid({ message: 'userId must be a valid UUID' }).optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  hireDate: z.string().date().optional(), // ISO date YYYY-MM-DD
});

export type CreateEmployeeBody = z.infer<typeof createEmployeeSchema>;

// ─────────────────────────────────────────────
// Update Schema
// ─────────────────────────────────────────────

export const updateEmployeeSchema = z.object({
  branchId: z.string().uuid().optional(),
  userId: z.string().uuid().nullable().optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  hireDate: z.string().date().optional(),
  status: z.nativeEnum(EmployeeStatus).optional(),
});

export type UpdateEmployeeBody = z.infer<typeof updateEmployeeSchema>;

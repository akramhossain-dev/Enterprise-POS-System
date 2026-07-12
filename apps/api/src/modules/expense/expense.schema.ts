import { z } from 'zod';
import { ExpenseCategoryStatus, ExpenseStatus, PaymentMethod } from '@prisma/client';

// ── Expense Category Schemas ───────────────────────────────────────────────
export const createExpenseCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().optional(),
  status: z.nativeEnum(ExpenseCategoryStatus).optional(),
});

export const updateExpenseCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ExpenseCategoryStatus).optional(),
});

// ── Expense Schemas ────────────────────────────────────────────────────────
export const createExpenseSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID').optional().nullable(),
  categoryId: z.string().uuid('Invalid category ID'),
  accountId: z.string().uuid('Invalid account ID'),
  date: z.coerce.date({ invalid_type_error: 'Invalid expense date' }),
  amount: z.coerce.number().gt(0, 'Expense amount must be greater than 0'),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  reference: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  attachment: z.string().optional().nullable(),
});

export const updateExpenseSchema = z.object({
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  date: z.coerce.date().optional(),
  amount: z.coerce.number().gt(0).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  reference: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  attachment: z.string().optional().nullable(),
  status: z.nativeEnum(ExpenseStatus).optional(),
});

// Types inferred
export type CreateExpenseCategoryPayload = z.infer<typeof createExpenseCategorySchema>;
export type UpdateExpenseCategoryPayload = z.infer<typeof updateExpenseCategorySchema>;
export type CreateExpensePayload = z.infer<typeof createExpenseSchema>;
export type UpdateExpensePayload = z.infer<typeof updateExpenseSchema>;

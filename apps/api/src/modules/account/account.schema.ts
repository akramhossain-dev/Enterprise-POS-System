import { z } from 'zod';
import { AccountType, AccountStatus } from '@prisma/client';

export const createAccountCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  type: z.nativeEnum(AccountType, {
    errorMap: () => ({ message: 'Invalid account type' }),
  }),
});

export const createAccountSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  parentId: z.string().uuid('Invalid parent account ID').optional().nullable(),
  accountCode: z.string().min(1, 'Account code is required').max(100),
  name: z.string().min(1, 'Account name is required').max(150),
  type: z.nativeEnum(AccountType, {
    errorMap: () => ({ message: 'Invalid account type' }),
  }),
  openingBalance: z.number().optional(),
  status: z.nativeEnum(AccountStatus).optional(),
});

export const updateAccountSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID').optional(),
  parentId: z.string().uuid('Invalid parent account ID').optional().nullable(),
  accountCode: z.string().min(1, 'Account code is required').max(100).optional(),
  name: z.string().min(1, 'Account name is required').max(150).optional(),
  status: z.nativeEnum(AccountStatus).optional(),
});

export const accountQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    type: z.nativeEnum(AccountType).optional(),
    status: z.nativeEnum(AccountStatus).optional(),
    search: z.string().optional(),
  })
  .transform((d) => ({
    ...d,
    page: d.page ?? 1,
    limit: d.limit ?? 20,
  }));

export type CreateAccountCategoryPayload = z.infer<typeof createAccountCategorySchema>;
export type CreateAccountPayload = z.infer<typeof createAccountSchema>;
export type UpdateAccountPayload = z.infer<typeof updateAccountSchema>;

import { z } from 'zod';
import { IncomeStatus, PaymentMethod } from '@prisma/client';

export const createIncomeSchema = z.object({
  branchId: z.string().uuid().optional().nullable(),
  accountId: z.string().uuid('Invalid account ID'),
  date: z.coerce.date({ invalid_type_error: 'Invalid income date' }),
  amount: z.coerce.number().gt(0, 'Income amount must be greater than 0'),
  source: z.string().max(150).optional().nullable(),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  reference: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
});

export const updateIncomeSchema = z.object({
  accountId: z.string().uuid().optional(),
  date: z.coerce.date().optional(),
  amount: z.coerce.number().gt(0).optional(),
  source: z.string().max(150).optional().nullable(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  reference: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(IncomeStatus).optional(),
});

export type CreateIncomePayload = z.infer<typeof createIncomeSchema>;
export type UpdateIncomePayload = z.infer<typeof updateIncomeSchema>;

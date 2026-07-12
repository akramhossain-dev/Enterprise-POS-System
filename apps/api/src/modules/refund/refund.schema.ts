import { z } from 'zod';
import { RefundMethod } from '@prisma/client';

export const createRefundSchema = z.object({
  salesReturnId: z.string().uuid('Invalid sales return ID'),
  amount: z.number().positive('Refund amount must be greater than 0'),
  refundMethod: z.nativeEnum(RefundMethod, {
    required_error: 'Refund method is required',
    invalid_type_error: 'Invalid refund method',
  }),
  reference: z.string().max(255).optional().nullable(),
});

export type CreateRefundPayload = z.infer<typeof createRefundSchema>;

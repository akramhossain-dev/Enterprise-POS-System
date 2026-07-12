import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const createPaymentSchema = z.object({
  saleId: z.string().uuid('Invalid sale ID'),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    required_error: 'Payment method is required',
    invalid_type_error: 'Invalid payment method',
  }),
  amount: z.number().positive('Payment amount must be greater than 0'),
  reference: z.string().max(255).optional().nullable(),
  transactionId: z.string().max(255).optional().nullable(),
});

export type CreatePaymentBody = z.infer<typeof createPaymentSchema>;

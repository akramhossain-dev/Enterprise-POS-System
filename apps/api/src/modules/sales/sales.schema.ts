import { z } from 'zod';
import { PaymentMethod, SaleStatus, PaymentStatus } from '@prisma/client';

export const checkoutPaymentDetailsSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod, {
    required_error: 'Payment method is required',
    invalid_type_error: 'Invalid payment method',
  }),
  amount: z.number().min(0, 'Payment amount must be non-negative'),
  reference: z.string().max(255).optional().nullable(),
  transactionId: z.string().max(255).optional().nullable(),
});

export const checkoutSchema = z.object({
  cartId: z.string().uuid('Invalid cart ID'),
  customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
  paymentDetails: checkoutPaymentDetailsSchema.optional().nullable(),
});

export const saleQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
    status: z.nativeEnum(SaleStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((d) => ({
    ...d,
    page: d.page ?? 1,
    limit: d.limit ?? 20,
    sortOrder: d.sortOrder ?? 'desc',
  }));

export type CheckoutPayload = z.infer<typeof checkoutSchema>;
export type SaleQuery = z.infer<typeof saleQuerySchema>;

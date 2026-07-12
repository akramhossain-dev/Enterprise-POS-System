import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

const PAYMENT_METHODS = Object.values(PaymentMethod) as [PaymentMethod, ...PaymentMethod[]];

export const createSupplierPaymentSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  supplierId: z.string().uuid('Supplier is required'),
  amount: z.coerce.number().positive('Payment amount must be greater than 0'),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({
      message: 'Invalid payment method. Use CASH, BANK, CARD, MOBILE_BANKING, or OTHER',
    }),
  }),
  paymentDate: z.string().datetime({ offset: true }).optional(),
  reference: z.string().max(255).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type CreateSupplierPaymentBody = z.infer<typeof createSupplierPaymentSchema>;

export const supplierPaymentQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    supplierId: z.string().uuid().optional(),
    paymentMethod: z.enum(PAYMENT_METHODS).optional(),
    paymentNumber: z.string().optional(),
    dateFrom: z.string().datetime({ offset: true }).optional(),
    dateTo: z.string().datetime({ offset: true }).optional(),
    search: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((d) => ({
    ...d,
    page: d.page ?? 1,
    limit: d.limit ?? 20,
    dateFrom: d.dateFrom ? new Date(d.dateFrom) : undefined,
    dateTo: d.dateTo ? new Date(d.dateTo) : undefined,
  }));

export type SupplierPaymentQuery = z.infer<typeof supplierPaymentQuerySchema>;
export type SupplierPaymentQueryInput = z.infer<typeof supplierPaymentQuerySchema>;
export type CreateSupplierPaymentInput = z.infer<typeof createSupplierPaymentSchema>;

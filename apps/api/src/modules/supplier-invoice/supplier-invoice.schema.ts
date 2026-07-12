import { z } from 'zod';
import { SupplierInvoiceStatus } from '@prisma/client';

const STATUS_VALUES = Object.values(SupplierInvoiceStatus) as [
  SupplierInvoiceStatus,
  ...SupplierInvoiceStatus[],
];

export const createSupplierInvoiceSchema = z.object({
  goodsReceiveId: z.string().uuid('Invalid Goods Receive ID'),
  invoiceNumber: z.string().min(1, 'Invoice number is required').max(100),
  invoiceDate: z.string().datetime({ offset: true }),
  tax: z.coerce.number().nonnegative('Tax cannot be negative').optional(),
  discount: z.coerce.number().nonnegative('Discount cannot be negative').optional(),
  subtotal: z.coerce.number().positive('Subtotal must be positive').optional(),
  grandTotal: z.coerce.number().positive('Grand total must be positive').optional(),
});

export type CreateSupplierInvoiceBody = z.infer<typeof createSupplierInvoiceSchema>;

export const supplierInvoiceQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    supplierId: z.string().uuid().optional(),
    status: z.enum(STATUS_VALUES).optional(),
    invoiceNumber: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((d) => ({
    ...d,
    page: d.page ?? 1,
    limit: d.limit ?? 20,
  }));

export type SupplierInvoiceQuery = z.infer<typeof supplierInvoiceQuerySchema>;

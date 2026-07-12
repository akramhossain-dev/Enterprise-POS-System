import { z } from 'zod';
import { SalesReturnStatus } from '@prisma/client';

export const createSalesReturnItemSchema = z.object({
  saleItemId: z.string().uuid('Invalid sale item ID'),
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().positive('Quantity must be greater than 0'),
});

export const createSalesReturnSchema = z.object({
  saleId: z.string().uuid('Invalid sale ID'),
  reason: z.string().max(1000).optional().nullable(),
  items: z.array(createSalesReturnItemSchema).nonempty('Return must contain at least one item'),
});

export const salesReturnQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.nativeEnum(SalesReturnStatus).optional(),
    saleId: z.string().uuid('Invalid sale ID').optional().nullable(),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
  })
  .transform((d) => ({
    ...d,
    page: d.page ?? 1,
    limit: d.limit ?? 20,
  }));

export type CreateSalesReturnPayload = z.infer<typeof createSalesReturnSchema>;
export type SalesReturnQuery = z.infer<typeof salesReturnQuerySchema>;

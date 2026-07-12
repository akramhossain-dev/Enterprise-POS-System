import { z } from 'zod';

export const invoiceParamsSchema = z.object({
  saleId: z.string().uuid('Invalid sale ID'),
});

export type InvoiceParams = z.infer<typeof invoiceParamsSchema>;

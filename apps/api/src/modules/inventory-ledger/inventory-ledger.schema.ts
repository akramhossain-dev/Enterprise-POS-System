import { z } from 'zod';

export const ledgerQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    dateFrom: z.string().datetime({ offset: true }).optional(),
    dateTo: z.string().datetime({ offset: true }).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((d) => ({
    ...d,
    page: d.page ?? 1,
    limit: d.limit ?? 50,
    dateFrom: d.dateFrom ? new Date(d.dateFrom) : undefined,
    dateTo: d.dateTo ? new Date(d.dateTo) : undefined,
  }));

export type LedgerQuery = z.infer<typeof ledgerQuerySchema>;

import { z } from 'zod';

export const createReconciliationSchema = z.object({
  stockTakeId: z.string().uuid(),
  remarks: z.string().max(2000).optional(),
});
export type CreateReconciliationBody = z.infer<typeof createReconciliationSchema>;

export const approveReconciliationSchema = z.object({
  remarks: z.string().max(2000).optional(),
});
export type ApproveReconciliationBody = z.infer<typeof approveReconciliationSchema>;

export const reconciliationQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    createdBy: z.string().uuid().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((d) => ({ ...d, page: d.page ?? 1, limit: d.limit ?? 20 }));
export type ReconciliationQuery = z.infer<typeof reconciliationQuerySchema>;

import { z } from 'zod';
import { AlertStatus } from '@prisma/client';

export const alertQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    alertType: z.enum(['LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRY_ALERT']).optional(),
    status: z.enum(Object.values(AlertStatus) as [AlertStatus, ...AlertStatus[]]).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((d) => ({ ...d, page: d.page ?? 1, limit: d.limit ?? 20 }));
export type AlertQuery = z.infer<typeof alertQuerySchema>;

export const resolveAlertSchema = z.object({
  remarks: z.string().max(2000).optional(),
});
export type ResolveAlertBody = z.infer<typeof resolveAlertSchema>;

export const scanAlertSchema = z.object({
  companyId: z.string().uuid(),
  warehouseId: z.string().uuid().optional(),
});
export type ScanAlertBody = z.infer<typeof scanAlertSchema>;

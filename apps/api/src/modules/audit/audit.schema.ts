import { z } from 'zod';

export const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(20),
  startDate: z.string().datetime().optional().or(z.string().date().optional()),
  endDate: z.string().datetime().optional().or(z.string().date().optional()),
  action: z.string().optional(),
  entityType: z.string().optional(),
  ipAddress: z.string().optional(),
  search: z.string().optional(),
});

export type AuditQuery = z.infer<typeof auditQuerySchema>;

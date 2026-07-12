import { z } from 'zod';

export const loginHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(20),
  startDate: z.string().datetime().optional().or(z.string().date().optional()),
  endDate: z.string().datetime().optional().or(z.string().date().optional()),
  userId: z.string().uuid().optional(),
  status: z.string().optional(),
  ipAddress: z.string().optional(),
});

export type LoginHistoryQuery = z.infer<typeof loginHistoryQuerySchema>;

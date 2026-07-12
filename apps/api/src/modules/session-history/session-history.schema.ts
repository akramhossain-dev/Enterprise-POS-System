import { z } from 'zod';

export const sessionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(20),
  userId: z.string().uuid().optional(),
});

export type SessionQuery = z.infer<typeof sessionQuerySchema>;

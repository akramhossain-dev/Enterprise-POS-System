import { z } from 'zod';

export const registerBodySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().trim().optional(),
});

export const loginBodySchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;

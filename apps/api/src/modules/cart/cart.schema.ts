import { z } from 'zod';

export const createCartSchema = z.object({
  sessionId: z.string().uuid('sessionId must be a valid UUID'),
  customerId: z.string().uuid('customerId must be a valid UUID').optional().nullable(),
});

export type CreateCartBody = z.infer<typeof createCartSchema>;

export const addCartItemSchema = z.object({
  productId: z.string().uuid('productId must be a valid UUID'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unitPrice: z.coerce.number().positive('Unit price must be positive').optional(),
  discount: z.coerce.number().nonnegative('Discount cannot be negative').optional(),
  tax: z.coerce.number().nonnegative('Tax cannot be negative').optional(),
});

export type AddCartItemBody = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unitPrice: z.coerce.number().positive('Unit price must be positive').optional(),
  discount: z.coerce.number().nonnegative('Discount cannot be negative').optional(),
  tax: z.coerce.number().nonnegative('Tax cannot be negative').optional(),
});

export type UpdateCartItemBody = z.infer<typeof updateCartItemSchema>;

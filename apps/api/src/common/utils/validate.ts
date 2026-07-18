import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/AppError';

// ─────────────────────────────────────────────
// Zod Validation Helpers
// ─────────────────────────────────────────────

/**
 * Validates data against a Zod schema and throws a ValidationError on failure.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validate<T>(schema: z.ZodType<T, any, any>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = formatZodErrors(result.error);
    throw new ValidationError('Validation failed', errors);
  }
  return result.data;
}

/**
 * Format Zod errors into human-readable string messages.
 */
export function formatZodErrors(error: ZodError): string[] {
  return error.errors.map((e) => {
    const path = e.path.length > 0 ? `${e.path.join('.')} — ` : '';
    return `${path}${e.message}`;
  });
}

/**
 * Validates request body against a Zod schema.
 * Throws ValidationError (422) if invalid.
 *
 * @example
 * const body = validateBody(CreateProductSchema, request.body);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateBody<T>(schema: z.ZodType<T, any, any>, data: unknown): T {
  return validate(schema, data);
}

/**
 * Validates query parameters against a Zod schema.
 * Throws ValidationError (422) if invalid.
 *
 * @example
 * const query = validateQuery(PaginationSchema, request.query);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateQuery<T>(schema: z.ZodType<T, any, any>, data: unknown): T {
  return validate(schema, data);
}

/**
 * Validates URL parameters against a Zod schema.
 * Throws ValidationError (422) if invalid.
 *
 * @example
 * const params = validateParams(UuidParamSchema, request.params);
 */
export function validateParams<T>(schema: ZodSchema<T>, data: unknown): T {
  return validate(schema, data);
}

// ─────────────────────────────────────────────
// Common Reusable Schemas
// ─────────────────────────────────────────────

/** UUID param schema — use for :id route params */
export const UuidParamSchema = z.object({
  id: z.string().uuid({ message: 'ID must be a valid UUID' }),
});

/** Pagination query schema */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type UuidParam = z.infer<typeof UuidParamSchema>;
export type PaginationQuery = z.infer<typeof PaginationSchema>;

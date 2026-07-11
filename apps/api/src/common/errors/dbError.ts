import { Prisma } from '@prisma/client';
import { AppError, ConflictError, NotFoundError, BadRequestError } from './AppError';

/**
 * Parses Prisma database errors and converts them to standard operational AppErrors.
 * Re-mapped errors carry specific HTTP status codes to be caught by the global error handler.
 *
 * @param error - The caught error object
 * @returns The mapped AppError or the original error if not matching any database code
 */
export function handleDatabaseError(error: unknown): unknown {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        // Unique constraint failed
        const targets = (error.meta?.target as string[] | undefined) ?? [];
        const fields = targets.join(', ');
        return new ConflictError(
          `A record with this value already exists${fields ? ` (field: ${fields})` : ''}`,
        );
      }
      case 'P2025': {
        // Record not found
        const cause = (error.meta?.cause as string | undefined) ?? 'Requested record not found';
        return new NotFoundError(cause);
      }
      case 'P2003': {
        // Foreign key constraint failed
        const fieldName = (error.meta?.field_name as string | undefined) ?? 'unknown';
        return new BadRequestError(
          `Related record does not exist (constraint violation on field: ${fieldName})`,
        );
      }
      default:
        // Catch-all for other Prisma specific errors
        return new AppError({
          message: `Database connection error: ${error.message} (code: ${error.code})`,
          statusCode: 500,
          code: 'INTERNAL_ERROR',
        });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new BadRequestError('Invalid database query parameters or input type constraints');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError({
      message:
        'Failed to initialize database connection. Connection timed out or datasource unreachable.',
      statusCode: 503,
      code: 'SERVICE_UNAVAILABLE',
    });
  }

  return error;
}

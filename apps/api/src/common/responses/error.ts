import type { ErrorCode } from '../errors/AppError';

// ─────────────────────────────────────────────
// Error Response Helper
// ─────────────────────────────────────────────

export interface ErrorResponse {
  success: false;
  message: string;
  errors: string[];
  code?: ErrorCode;
  statusCode: number;
}

export interface SendErrorOptions {
  message?: string;
  errors?: string[];
  statusCode?: number;
  code?: ErrorCode;
}

/**
 * Build a standardised error response object.
 *
 * @example
 * reply.status(404).send(sendError({ message: 'User not found', statusCode: 404 }));
 */
export function sendError(options: SendErrorOptions = {}): ErrorResponse {
  return {
    success: false,
    message: options.message ?? 'An error occurred',
    errors: options.errors ?? [],
    statusCode: options.statusCode ?? 500,
    ...(options.code !== undefined ? { code: options.code } : {}),
  };
}

// ─────────────────────────────────────────────
// Custom Application Error Classes
// ─────────────────────────────────────────────

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST'
  | 'UNPROCESSABLE_ENTITY'
  | 'SERVICE_UNAVAILABLE';

export interface AppErrorOptions {
  message: string;
  statusCode?: number;
  code?: ErrorCode;
  errors?: string[];
  cause?: unknown;
}

/**
 * Base application error class.
 * Extend this for domain-specific errors.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly errors: string[];
  public readonly isOperational: boolean;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = this.constructor.name;
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.errors = options.errors ?? [];
    this.isOperational = true;

    // Maintain proper prototype chain in transpiled JS
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─────────────────────────────────────────────
// Specific Error Types
// ─────────────────────────────────────────────

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors: string[] = []) {
    super({ message, statusCode: 422, code: 'VALIDATION_ERROR', errors });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super({ message, statusCode: 404, code: 'NOT_FOUND' });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super({ message, statusCode: 401, code: 'UNAUTHORIZED' });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super({ message, statusCode: 403, code: 'FORBIDDEN' });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super({ message, statusCode: 409, code: 'CONFLICT' });
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors: string[] = []) {
    super({ message, statusCode: 400, code: 'BAD_REQUEST', errors });
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super({ message, statusCode: 429, code: 'TOO_MANY_REQUESTS' });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super({ message, statusCode: 503, code: 'SERVICE_UNAVAILABLE' });
  }
}

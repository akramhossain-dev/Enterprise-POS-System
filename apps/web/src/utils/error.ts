import type { ApiError, ApiErrorResponse } from '@/types/api';

/**
 * Normalizes any error shape into a consistent ApiError object.
 */
export function normalizeError(error: unknown): ApiError {
  // Axios error with response
  if (isAxiosError(error)) {
    const response = error.response;
    if (response) {
      const data = response.data as ApiErrorResponse | undefined;
      return {
        code: data?.error?.code ?? 'API_ERROR',
        message: data?.error?.message ?? response.statusText ?? 'An error occurred',
        statusCode: response.status,
        details: data?.error?.details,
        isAuthError: response.status === 401 || response.status === 403,
      };
    }

    // Network error (no response)
    if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        statusCode: 0,
        isNetworkError: true,
      };
    }
  }

  // Native Error
  if (error instanceof Error) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message,
      statusCode: 0,
    };
  }

  // Unknown
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred.',
    statusCode: 0,
  };
}

/** Type guard for Axios errors */
function isAxiosError(
  error: unknown,
): error is {
  response?: { data?: unknown; status: number; statusText: string };
  request?: unknown;
} {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}

/** Get a user-friendly message for common HTTP status codes */
export function getHttpErrorMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: 'Bad request. Please check your input.',
    401: 'Your session has expired. Please login again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. The resource may already exist.',
    422: 'Validation failed. Please check your input.',
    429: 'Too many requests. Please try again later.',
    500: 'Internal server error. Please try again later.',
    502: 'Service temporarily unavailable. Please try again.',
    503: 'Service is under maintenance. Please try again later.',
  };
  return messages[statusCode] ?? 'An unexpected error occurred.';
}

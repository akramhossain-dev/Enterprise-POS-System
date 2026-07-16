import { describe, it, expect } from 'vitest';
import { normalizeError, getHttpErrorMessage } from '@/utils/error';

// ──────────────────────────────────────────────────────────
// normalizeError
// ──────────────────────────────────────────────────────────

describe('normalizeError', () => {
  it('handles an Axios error with a response body', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 404,
        statusText: 'Not Found',
        data: { error: { code: 'NOT_FOUND', message: 'Resource not found' } },
      },
    };

    const result = normalizeError(axiosError);
    expect(result.code).toBe('NOT_FOUND');
    expect(result.message).toBe('Resource not found');
    expect(result.statusCode).toBe(404);
    expect(result.isAuthError).toBe(false);
  });

  it('marks 401 as an auth error', () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 401, statusText: 'Unauthorized', data: {} },
    };
    const result = normalizeError(axiosError);
    expect(result.isAuthError).toBe(true);
    expect(result.statusCode).toBe(401);
  });

  it('marks 403 as an auth error', () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 403, statusText: 'Forbidden', data: {} },
    };
    const result = normalizeError(axiosError);
    expect(result.isAuthError).toBe(true);
  });

  it('handles a network error (no response, has request)', () => {
    const axiosError = {
      isAxiosError: true,
      request: {},
    };
    const result = normalizeError(axiosError);
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.isNetworkError).toBe(true);
    expect(result.statusCode).toBe(0);
  });

  it('handles a native Error object', () => {
    const error = new Error('Something exploded');
    const result = normalizeError(error);
    expect(result.code).toBe('CLIENT_ERROR');
    expect(result.message).toBe('Something exploded');
    expect(result.statusCode).toBe(0);
  });

  it('handles an unknown non-error value', () => {
    const result = normalizeError('just a string');
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.statusCode).toBe(0);
  });

  it('handles null', () => {
    const result = normalizeError(null);
    expect(result.code).toBe('UNKNOWN_ERROR');
  });

  it('uses statusText when response data message is missing', () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 500, statusText: 'Internal Server Error', data: {} },
    };
    const result = normalizeError(axiosError);
    expect(result.message).toBe('Internal Server Error');
  });
});

// ──────────────────────────────────────────────────────────
// getHttpErrorMessage
// ──────────────────────────────────────────────────────────

describe('getHttpErrorMessage', () => {
  const cases: [number, string][] = [
    [400, 'Bad request'],
    [401, 'session has expired'],
    [403, 'permission'],
    [404, 'not found'],
    [409, 'conflict'],
    [422, 'Validation failed'],
    [429, 'Too many requests'],
    [500, 'Internal server error'],
    [502, 'temporarily unavailable'],
    [503, 'maintenance'],
  ];

  cases.forEach(([code, fragment]) => {
    it(`returns a message containing "${fragment}" for status ${code}`, () => {
      const msg = getHttpErrorMessage(code);
      expect(msg.toLowerCase()).toContain(fragment.toLowerCase());
    });
  });

  it('returns a fallback message for unknown status codes', () => {
    const msg = getHttpErrorMessage(418);
    expect(msg).toBe('An unexpected error occurred.');
  });
});

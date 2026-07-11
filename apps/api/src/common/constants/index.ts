// ─────────────────────────────────────────────
// Application Constants
// ─────────────────────────────────────────────

export const API_VERSION = 'v1' as const;
export const API_PREFIX = `/api/${API_VERSION}` as const;

// HTTP Status Codes (commonly used shortcuts)
export const HTTP = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Date formats
export const DATE_FORMAT = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DATE_ONLY: 'YYYY-MM-DD',
  DISPLAY: 'DD MMM YYYY',
  DISPLAY_WITH_TIME: 'DD MMM YYYY HH:mm',
} as const;

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  REPORT: 30 * 60, // 30 minutes
  SESSION: 15 * 60, // 15 minutes
  LOW_STOCK: 5 * 60, // 5 minutes
  RATE_LIMIT: 60, // 1 minute
} as const;

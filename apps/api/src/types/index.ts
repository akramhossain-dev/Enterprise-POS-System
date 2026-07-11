// ─────────────────────────────────────────────
// Backend TypeScript Type Definitions
// ─────────────────────────────────────────────

// ── Fastify augmentations are in plugin files ──

/**
 * Standard API response envelope types.
 * Re-used across all modules.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: string[];
  statusCode: number;
  code?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Common query parameter shapes.
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic ID param from URL.
 */
export interface IdParam {
  id: string;
}

/**
 * Type helper for async route handlers.
 */
export type AsyncRouteHandler<
  Params = unknown,
  Body = unknown,
  Query = unknown,
  Reply = unknown,
> = (params: Params, body: Body, query: Query) => Promise<Reply>;

// ─────────────────────────────────────────────
// Success Response Helper
// ─────────────────────────────────────────────

export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface SendSuccessOptions<T = unknown> {
  message?: string;
  data?: T;
  meta?: ResponseMeta;
}

/**
 * Build a standardised success response object.
 *
 * @example
 * reply.status(200).send(sendSuccess({ message: 'User fetched', data: user }));
 */
export function sendSuccess<T = unknown>(options: SendSuccessOptions<T> = {}): SuccessResponse<T> {
  return {
    success: true,
    message: options.message ?? 'Success',
    data: options.data ?? ({} as T),
    ...(options.meta !== undefined ? { meta: options.meta } : {}),
  };
}

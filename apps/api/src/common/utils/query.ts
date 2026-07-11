import { PaginationMeta } from '../../types';

export interface PaginationQueryOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
}

/**
 * Builds Prisma skip/take pagination options from page/limit.
 * Ensures bounds checks are enforced.
 *
 * @example
 * const { skip, take } = paginate(query);
 */
export function paginate(options: PaginationQueryOptions = {}): PaginationResult {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.max(1, Math.min(100, options.limit ?? 20));

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

/**
 * Formats pagination metadata to send to the client.
 *
 * @example
 * const meta = buildPaginationMeta(page, limit, total);
 */
export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const safeLimit = Math.max(1, limit);
  const totalPages = Math.ceil(total / safeLimit);
  return {
    page: Math.max(1, page),
    limit: safeLimit,
    total,
    totalPages,
  };
}

/**
 * Builds a Prisma orderBy object.
 *
 * @example
 * const orderBy = sortBuilder(query.sortBy, query.sortOrder);
 */
export function sortBuilder(
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  defaultSortBy = 'createdAt',
  defaultSortOrder: 'asc' | 'desc' = 'desc',
): Record<string, 'asc' | 'desc'> {
  const field = sortBy ?? defaultSortBy;
  const direction = sortOrder ?? defaultSortOrder;
  return { [field]: direction };
}

/**
 * Builds a Prisma filter object for string search fields using case-insensitive contains.
 *
 * @example
 * const where = filterBuilder(query.q, ['name', 'description']);
 */
export function filterBuilder(
  searchQuery?: string,
  fields: string[] = [],
): Record<string, unknown> {
  if (!searchQuery || fields.length === 0) {
    return {};
  }

  const terms = searchQuery.trim();
  if (!terms) {
    return {};
  }

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: terms,
        mode: 'insensitive',
      },
    })),
  };
}

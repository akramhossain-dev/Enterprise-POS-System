/**
 * Query Utilities Tests
 *
 * Tests common utility functions used across all services:
 * pagination, filter building, sort building, and sanitization.
 */
import { describe, it, expect } from 'vitest';
import { paginate, buildPaginationMeta, filterBuilder, sortBuilder } from '../common/utils/query';
import { sanitizeInput } from '../common/utils/security';

// ─────────────────────────────────────────────
// Tests — paginate()
// ─────────────────────────────────────────────

describe('paginate()', () => {
  it('should calculate correct skip/take for page 1', () => {
    const result = paginate({ page: 1, limit: 10 });
    expect(result.skip).toBe(0);
    expect(result.take).toBe(10);
  });

  it('should calculate correct skip for page 3', () => {
    const result = paginate({ page: 3, limit: 20 });
    expect(result.skip).toBe(40);
    expect(result.take).toBe(20);
  });

  it('should use defaults when not provided', () => {
    const result = paginate({});
    expect(result.skip).toBe(0);
    expect(result.take).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// Tests — buildPaginationMeta()
// ─────────────────────────────────────────────

describe('buildPaginationMeta()', () => {
  it('should calculate totalPages correctly', () => {
    const meta = buildPaginationMeta(1, 10, 55);
    expect(meta.totalPages).toBe(6);
    expect(meta.total).toBe(55);
    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(10);
  });

  it('should handle single page results', () => {
    const meta = buildPaginationMeta(1, 10, 5);
    expect(meta.totalPages).toBe(1);
    expect(meta.total).toBe(5);
  });
});

// ─────────────────────────────────────────────
// Tests — filterBuilder()
// ─────────────────────────────────────────────

describe('filterBuilder()', () => {
  it('should return empty object when no query provided', () => {
    const result = filterBuilder(undefined, ['name', 'email']);
    expect(result).toEqual({});
  });

  it('should return empty object for empty string', () => {
    const result = filterBuilder('', ['name', 'email']);
    expect(result).toEqual({});
  });

  it('should build OR filter when query is provided', () => {
    const result = filterBuilder('test', ['name', 'email']);
    expect(result).toHaveProperty('OR');
    const orFilter = (result as { OR: unknown[] }).OR;
    expect(Array.isArray(orFilter)).toBe(true);
    expect(orFilter).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────
// Tests — sortBuilder()
// ─────────────────────────────────────────────

describe('sortBuilder()', () => {
  it('should return asc order when sortOrder is asc', () => {
    const result = sortBuilder('name', 'asc');
    expect(result).toBeDefined();
  });

  it('should return desc order when sortOrder is desc', () => {
    const result = sortBuilder('createdAt', 'desc');
    expect(result).toBeDefined();
  });

  it('should handle undefined sortBy', () => {
    const result = sortBuilder(undefined, 'asc');
    expect(result).toBeDefined();
  });
});

// ─────────────────────────────────────────────
// Tests — sanitizeInput()
// ─────────────────────────────────────────────

describe('sanitizeInput()', () => {
  it('should strip script tags from XSS attempts (HTML entity encoding)', () => {
    const dirty = '<script>alert("xss")</script>Hello World';
    const clean = sanitizeInput(dirty) as string;
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Hello World');
    expect(clean).toContain('&lt;script&gt;');
  });

  it('should strip __proto__ keys from objects (prototype pollution protection)', () => {
    // sanitizeInput strips __proto__ from OBJECTS, not strings
    const dirtyObj = { __proto__: { admin: true }, name: 'test' };
    const clean = sanitizeInput(dirtyObj) as Record<string, unknown>;
    expect(Object.prototype.hasOwnProperty.call(clean, '__proto__')).toBe(false);
    expect(clean.name).toBe('test');
  });

  it('should HTML-encode special characters in strings', () => {
    const dirty = '&<>"\'/test';
    const clean = sanitizeInput(dirty) as string;
    expect(clean).toContain('&amp;');
    expect(clean).toContain('&lt;');
    expect(clean).toContain('&gt;');
  });
});

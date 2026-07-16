import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatRelative,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatCompactNumber,
  capitalize,
  titleCase,
  truncate,
  slugify,
  formatFileSize,
} from '@/utils/format';

// ──────────────────────────────────────────────────────────
// Date Formatters
// ──────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('returns em-dash for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('returns em-dash for undefined', () => {
    expect(formatDate(undefined)).toBe('—');
  });

  it('returns em-dash for invalid ISO string', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('formats a valid ISO date string', () => {
    const result = formatDate('2024-01-15', 'yyyy-MM-dd');
    expect(result).toBe('2024-01-15');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-06-01'), 'yyyy-MM-dd');
    expect(result).toBe('2024-06-01');
  });
});

describe('formatDateTime', () => {
  it('returns em-dash for null', () => {
    expect(formatDateTime(null)).toBe('—');
  });

  it('returns em-dash for invalid date', () => {
    expect(formatDateTime('bad')).toBe('—');
  });

  it('formats a valid date-time string (returns a non-empty string)', () => {
    const result = formatDateTime('2024-01-15T10:30:00Z');
    expect(result).not.toBe('—');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatRelative', () => {
  it('returns em-dash for null', () => {
    expect(formatRelative(null)).toBe('—');
  });

  it('returns a relative string like "ago" for a past date', () => {
    const result = formatRelative('2020-01-01T00:00:00Z');
    expect(result).toMatch(/ago/);
  });
});

// ──────────────────────────────────────────────────────────
// Currency Formatters
// ──────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('returns em-dash for null', () => {
    expect(formatCurrency(null)).toBe('—');
  });

  it('returns em-dash for undefined', () => {
    expect(formatCurrency(undefined)).toBe('—');
  });

  it('formats a positive amount', () => {
    const result = formatCurrency(1234.56, 'USD', 'en-US');
    expect(result).toContain('1,234.56');
  });

  it('formats zero', () => {
    const result = formatCurrency(0, 'USD', 'en-US');
    expect(result).toContain('0.00');
  });

  it('formats a negative amount', () => {
    const result = formatCurrency(-500, 'USD', 'en-US');
    expect(result).toContain('500.00');
  });
});

// ──────────────────────────────────────────────────────────
// Number Formatters
// ──────────────────────────────────────────────────────────

describe('formatNumber', () => {
  it('returns em-dash for null', () => {
    expect(formatNumber(null)).toBe('—');
  });

  it('returns em-dash for undefined', () => {
    expect(formatNumber(undefined)).toBe('—');
  });

  it('formats a number', () => {
    const result = formatNumber(1000);
    expect(result).not.toBe('—');
  });
});

describe('formatPercent', () => {
  it('returns em-dash for null', () => {
    expect(formatPercent(null)).toBe('—');
  });

  it('formats 100 as "100.0%"', () => {
    expect(formatPercent(100)).toBe('100.0%');
  });

  it('formats with custom decimals', () => {
    expect(formatPercent(55.555, 2)).toBe('55.55%');
  });
});

describe('formatCompactNumber', () => {
  it('formats large numbers with compact notation', () => {
    const result = formatCompactNumber(1_000_000);
    expect(result).toMatch(/1M|1\s?M/);
  });

  it('formats thousands', () => {
    const result = formatCompactNumber(5_000);
    expect(result).toMatch(/5K|5\s?K/);
  });
});

// ──────────────────────────────────────────────────────────
// String Formatters
// ──────────────────────────────────────────────────────────

describe('capitalize', () => {
  it('capitalizes the first letter and lowercases the rest', () => {
    expect(capitalize('hELLO')).toBe('Hello');
  });

  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('titleCase', () => {
  it('converts underscore-separated words to title case', () => {
    expect(titleCase('hello_world')).toBe('Hello World');
  });

  it('converts hyphen-separated words to title case', () => {
    expect(titleCase('foo-bar-baz')).toBe('Foo Bar Baz');
  });

  it('converts space-separated words to title case', () => {
    expect(titleCase('foo bar')).toBe('Foo Bar');
  });
});

describe('truncate', () => {
  it('does not truncate when string is shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates when string exceeds maxLength', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });

  it('does not truncate when string equals maxLength', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! World@')).toBe('hello-world');
  });

  it('removes leading and trailing hyphens', () => {
    expect(slugify('  hello  ')).toBe('hello');
  });
});

// ──────────────────────────────────────────────────────────
// File Size Formatter
// ──────────────────────────────────────────────────────────

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
  });
});

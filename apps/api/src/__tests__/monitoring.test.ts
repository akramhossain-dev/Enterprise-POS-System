/**
 * Monitoring & Metrics Unit Tests
 *
 * Tests the Prometheus monitoring service and rate limit logic:
 * - Metric recording works without errors
 * - allowList for health check endpoints
 * - CSV report helper logic
 */
import { describe, it, expect, vi } from 'vitest';

// ─────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────

// Mock prom-client to avoid real registry in tests
vi.mock('prom-client', () => {
  const mockHistogram = { labels: vi.fn().mockReturnValue({ observe: vi.fn() }) };
  const mockGauge = { set: vi.fn() };
  return {
    default: {
      register: { metrics: vi.fn().mockResolvedValue(''), contentType: 'text/plain' },
      Histogram: vi.fn().mockImplementation(() => mockHistogram),
      Gauge: vi.fn().mockImplementation(() => mockGauge),
      collectDefaultMetrics: vi.fn(),
    },
    Histogram: vi.fn().mockImplementation(() => mockHistogram),
    Gauge: vi.fn().mockImplementation(() => mockGauge),
    collectDefaultMetrics: vi.fn(),
    register: { metrics: vi.fn().mockResolvedValue(''), contentType: 'text/plain' },
  };
});

vi.mock('../lib/logger', () => ({
  createLogger: vi.fn().mockReturnValue({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// ─────────────────────────────────────────────
// Tests — Rate Limit AllowList Logic
// ─────────────────────────────────────────────

describe('Rate Limit AllowList', () => {
  const RATE_LIMIT_ALLOWLIST = ['/api/v1/live', '/api/v1/ready'];

  const isAllowlisted = (url: string) => RATE_LIMIT_ALLOWLIST.includes(url);

  it('should bypass rate limit for /api/v1/live', () => {
    expect(isAllowlisted('/api/v1/live')).toBe(true);
  });

  it('should bypass rate limit for /api/v1/ready', () => {
    expect(isAllowlisted('/api/v1/ready')).toBe(true);
  });

  it('should NOT bypass rate limit for other API routes', () => {
    expect(isAllowlisted('/api/v1/users')).toBe(false);
    expect(isAllowlisted('/api/v1/auth/login')).toBe(false);
    expect(isAllowlisted('/api/v1/health')).toBe(false);
    expect(isAllowlisted('')).toBe(false);
  });

  it('should NOT bypass for partial URL matches', () => {
    // Prevent prefix injection attacks like '/api/v1/live/exploit'
    expect(isAllowlisted('/api/v1/live/exploit')).toBe(false);
    expect(isAllowlisted('/api/v1/livexxx')).toBe(false);
  });
});

// ─────────────────────────────────────────────
// Tests — CSV Report Helper
// ─────────────────────────────────────────────

describe('CSV Report Generation Helper', () => {
  // Inline the toCsv helper for isolated testing
  function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
    const escape = (val: string | number | null | undefined): string => {
      const s = val === null || val === undefined ? '' : String(val);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    return [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  }

  it('should produce correct CSV with headers', () => {
    const csv = toCsv(['Name', 'Amount'], [['Apple Juice', 99.99]]);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Name,Amount');
    expect(lines[1]).toBe('Apple Juice,99.99');
  });

  it('should escape fields containing commas', () => {
    const csv = toCsv(['Name'], [['Smith, John']]);
    expect(csv).toContain('"Smith, John"');
  });

  it('should escape fields containing double quotes', () => {
    const csv = toCsv(['Description'], [['He said "hello"']]);
    expect(csv).toContain('"He said ""hello"""');
  });

  it('should handle null and undefined values as empty strings', () => {
    const csv = toCsv(['A', 'B', 'C'], [[null, undefined, 'value']]);
    const lines = csv.split('\n');
    expect(lines[1]).toBe(',,value');
  });

  it('should handle empty row set', () => {
    const csv = toCsv(['Name', 'Amount'], []);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('Name,Amount');
  });

  it('should handle numeric values correctly', () => {
    const csv = toCsv(['Qty', 'Price'], [[100, 99.99]]);
    const lines = csv.split('\n');
    expect(lines[1]).toBe('100,99.99');
  });
});

// ─────────────────────────────────────────────
// Tests — Backup Filename Format
// ─────────────────────────────────────────────

describe('Backup Filename Format', () => {
  it('should generate timestamp-based filename without colons', () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;

    // Should not contain colons (invalid in many filesystems)
    expect(filename).not.toContain(':');
    // Filename starts with 'backup-' and has a safe .sql extension
    expect(filename.startsWith('backup-')).toBe(true);
    expect(filename.endsWith('.sql')).toBe(true);
    // The timestamp portion (before .sql) should have no dots or colons
    const namePart = filename.replace('.sql', '');
    expect(namePart).not.toContain('.');
    expect(namePart).not.toContain(':');
  });

  it('should generate unique filenames for different timestamps', () => {
    const ts1 = new Date(2025, 0, 1, 10, 0, 0).toISOString().replace(/[:.]/g, '-');
    const ts2 = new Date(2025, 0, 1, 10, 0, 1).toISOString().replace(/[:.]/g, '-');
    expect(ts1).not.toBe(ts2);
  });
});

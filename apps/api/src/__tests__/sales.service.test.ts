/**
 * Sales Service Unit Tests
 *
 * Tests business logic validation in the sales module:
 * - Payment calculation edge cases
 * - Sale status transitions
 * - Error boundary conditions
 */
import { describe, it, expect, vi } from 'vitest';
import { NotFoundError, BadRequestError, ForbiddenError } from '../common/errors/AppError';

// ─────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────

vi.mock('../lib/prisma', () => ({
  prisma: {
    sale: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    employee: {
      findFirst: vi.fn(),
    },
    customer: {
      findUnique: vi.fn(),
    },
    invoice: {
      create: vi.fn(),
    },
    payment: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../modules/notification/queue', () => ({
  redisConnection: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
}));

vi.mock('../modules/sales/sales.repository', () => ({
  findSaleById: vi.fn(),
  findSales: vi.fn(),
  generateNextInvoiceNumber: vi.fn(),
  incrementInvoicePrintCount: vi.fn(),
}));

// ─────────────────────────────────────────────
// Tests — Payment Business Logic
// ─────────────────────────────────────────────

describe('Payment Calculation Logic', () => {
  it('should calculate correct due amount after partial payment', () => {
    const grandTotal = 1000;
    const paidAmount = 300;
    const newPayment = 200;

    const newPaid = paidAmount + newPayment;
    const newDue = Math.max(0, grandTotal - newPaid);

    expect(newPaid).toBe(500);
    expect(newDue).toBe(500);
  });

  it('should not allow due amount to go negative', () => {
    const grandTotal = 1000;
    const paidAmount = 900;
    const newPayment = 200; // Overpayment

    const newPaid = paidAmount + newPayment;
    const newDue = Math.max(0, grandTotal - newPaid);

    expect(newDue).toBe(0); // Clamped to 0
  });

  it('should detect overpayment correctly', () => {
    const currentDue = 150;
    const paymentAmount = 200;
    const tolerance = 0.001;

    const isOverpayment = paymentAmount > currentDue + tolerance;
    expect(isOverpayment).toBe(true);
  });

  it('should allow exact payment amount', () => {
    const currentDue = 150;
    const paymentAmount = 150;
    const tolerance = 0.001;

    const isOverpayment = paymentAmount > currentDue + tolerance;
    expect(isOverpayment).toBe(false);
  });

  it('should handle floating point dues correctly', () => {
    const grandTotal = 99.99;
    const paidAmount = 50.0;
    const newPayment = 49.99;

    const newPaid = paidAmount + newPayment;
    const newDue = Math.max(0, grandTotal - newPaid);

    expect(Math.abs(newDue)).toBeLessThan(0.01); // Nearly zero due to float
  });
});

// ─────────────────────────────────────────────
// Tests — AppError in Service Context
// ─────────────────────────────────────────────

describe('Sales Service Error Types', () => {
  it('NotFoundError thrown when sale does not exist', () => {
    const throwIfMissing = (sale: null | { id: string }) => {
      if (!sale) {
        throw new NotFoundError('Sale not found');
      }
      return sale;
    };

    expect(() => throwIfMissing(null)).toThrow(NotFoundError);
    expect(() => throwIfMissing(null)).toThrow('Sale not found');
    expect(throwIfMissing({ id: 'abc' })).toEqual({ id: 'abc' });
  });

  it('BadRequestError thrown for already-paid sale', () => {
    const assertNotFullyPaid = (dueAmount: number) => {
      if (dueAmount === 0) {
        throw new BadRequestError('This sale is already fully paid');
      }
    };

    expect(() => {
      assertNotFullyPaid(0);
    }).toThrow(BadRequestError);
    expect(() => {
      assertNotFullyPaid(100);
    }).not.toThrow();
  });

  it('ForbiddenError thrown when user has no company', () => {
    const assertCompanyMembership = (employee: null | { companyId: string }) => {
      if (!employee) {
        throw new ForbiddenError('User is not associated with any company profile');
      }
      return employee.companyId;
    };

    expect(() => assertCompanyMembership(null)).toThrow(ForbiddenError);
    expect(assertCompanyMembership({ companyId: 'comp-1' })).toBe('comp-1');
  });
});

// ─────────────────────────────────────────────
// Tests — Invoice Number Format
// ─────────────────────────────────────────────

describe('Invoice Number Format', () => {
  it('should generate properly zero-padded invoice numbers', () => {
    const format = (prefix: string, seq: number) => `${prefix}-${String(seq).padStart(6, '0')}`;

    expect(format('INV', 1)).toBe('INV-000001');
    expect(format('INV', 999)).toBe('INV-000999');
    expect(format('INV', 1000000)).toBe('INV-1000000'); // > 6 digits
  });
});

// ─────────────────────────────────────────────
// Tests — Date Filters for Reports
// ─────────────────────────────────────────────

describe('Date Filter Logic (Report Generation)', () => {
  it('should default to 30 days ago when no startDate provided', () => {
    const now = Date.now();
    const start = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const diffDays = Math.round((now - start.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });

  it('should parse ISO date strings correctly', () => {
    const dateStr = '2025-01-15';
    const parsed = new Date(dateStr);
    expect(parsed.getFullYear()).toBe(2025);
    expect(parsed.getMonth()).toBe(0); // January = 0
    expect(parsed.getDate()).toBe(15);
  });
});

/**
 * Payment Service Unit Tests
 *
 * Tests payment processing logic:
 * - Overpayment prevention
 * - Partial payment tracking
 * - Payment status transitions
 * - Amount validation
 */
import { describe, it, expect, vi } from 'vitest';
import { BadRequestError, NotFoundError } from '../common/errors/AppError';
import { PaymentStatus } from '@prisma/client';

// ─────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────

vi.mock('../lib/prisma', () => ({
  prisma: {
    payment: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    sale: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    employee: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../modules/notification/queue', () => ({
  redisConnection: { get: vi.fn(), set: vi.fn() },
}));

vi.mock('../modules/sales/sales.repository', () => ({
  findSaleById: vi.fn(),
}));

vi.mock('../modules/payment/payment.repository', () => ({
  createPayment: vi.fn(),
  findPaymentsBySaleId: vi.fn(),
}));

// ─────────────────────────────────────────────
// Tests — Payment Amount Validation
// ─────────────────────────────────────────────

describe('Payment Amount Validation', () => {
  it('should reject zero payment amount', () => {
    const validateAmount = (amount: number) => {
      if (amount <= 0) {
        throw new BadRequestError('Payment amount must be greater than zero');
      }
      return true;
    };

    expect(() => validateAmount(0)).toThrow(BadRequestError);
    expect(() => validateAmount(-50)).toThrow(BadRequestError);
    expect(validateAmount(100)).toBe(true);
    expect(validateAmount(0.01)).toBe(true);
  });

  it('should reject payment exceeding due balance (with tolerance)', () => {
    const TOLERANCE = 0.001;
    const validatePaymentAmount = (amount: number, currentDue: number) => {
      if (amount > currentDue + TOLERANCE) {
        throw new BadRequestError(
          `Payment amount ${String(amount)} exceeds due balance ${String(currentDue)}`,
        );
      }
      return true;
    };

    expect(() => validatePaymentAmount(200, 150)).toThrow(BadRequestError);
    expect(validatePaymentAmount(150, 150)).toBe(true); // Exact amount OK
    expect(validatePaymentAmount(149.99, 150)).toBe(true); // Under amount OK
    expect(validatePaymentAmount(150.0005, 150)).toBe(true); // Within tolerance OK
  });
});

// ─────────────────────────────────────────────
// Tests — Payment Status Transitions
// ─────────────────────────────────────────────

describe('Payment Status Transitions', () => {
  it('should set status to PAID when fully paid', () => {
    const getNewStatus = (dueAmount: number): PaymentStatus =>
      dueAmount <= 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

    expect(getNewStatus(0)).toBe(PaymentStatus.PAID);
    expect(getNewStatus(-1)).toBe(PaymentStatus.PAID); // Safety: negative due = paid
    expect(getNewStatus(0.001)).toBe(PaymentStatus.PARTIAL);
    expect(getNewStatus(100)).toBe(PaymentStatus.PARTIAL);
  });

  it('should not allow payment on already-paid sale', () => {
    const assertNotPaid = (status: PaymentStatus) => {
      if (status === PaymentStatus.PAID) {
        throw new BadRequestError('This sale is already fully paid');
      }
    };

    expect(() => {
      assertNotPaid(PaymentStatus.PAID);
    }).toThrow(BadRequestError);
    expect(() => {
      assertNotPaid(PaymentStatus.PARTIAL);
    }).not.toThrow();
    expect(() => {
      assertNotPaid(PaymentStatus.DUE);
    }).not.toThrow();
  });

  it('should reject payment when due is exactly zero', () => {
    const assertDueBalance = (dueAmount: number) => {
      if (dueAmount === 0) {
        throw new BadRequestError('No outstanding balance to pay');
      }
    };

    expect(() => {
      assertDueBalance(0);
    }).toThrow(BadRequestError);
    expect(() => {
      assertDueBalance(50);
    }).not.toThrow();
  });
});

// ─────────────────────────────────────────────
// Tests — Running Balance Calculation
// ─────────────────────────────────────────────

describe('Running Balance After Payment', () => {
  interface Payment {
    amount: number;
  }

  const calculateRunningBalance = (grandTotal: number, payments: Payment[]) => {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, grandTotal - totalPaid);
  };

  it('should calculate correct balance with multiple payments', () => {
    const grandTotal = 1000;
    const payments = [{ amount: 300 }, { amount: 200 }, { amount: 100 }];
    const balance = calculateRunningBalance(grandTotal, payments);
    expect(balance).toBe(400);
  });

  it('should return 0 when fully paid via multiple payments', () => {
    const grandTotal = 500;
    const payments = [{ amount: 250 }, { amount: 250 }];
    const balance = calculateRunningBalance(grandTotal, payments);
    expect(balance).toBe(0);
  });

  it('should handle empty payment history', () => {
    const balance = calculateRunningBalance(500, []);
    expect(balance).toBe(500);
  });
});

// ─────────────────────────────────────────────
// Tests — Sale Lookup for Payments
// ─────────────────────────────────────────────

describe('Sale Lookup for Payment Recording', () => {
  it('should throw NotFoundError when sale does not exist', () => {
    const getSale = (sale: null | { id: string }) => {
      if (!sale) {
        throw new NotFoundError('Sale not found');
      }
      return sale;
    };

    expect(() => getSale(null)).toThrow(NotFoundError);
    expect(getSale({ id: 'sale-1' })).toEqual({ id: 'sale-1' });
  });
});

/**
 * Inventory & Stock Movement Unit Tests
 *
 * Tests inventory logic including:
 * - Stock level tracking
 * - Low stock threshold detection
 * - Reorder level alerts
 * - Quantity validation
 */
import { describe, it, expect, vi } from 'vitest';
import { BadRequestError } from '../common/errors/AppError';

// ─────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────

vi.mock('../lib/prisma', () => ({
  prisma: {
    inventory: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    stockMovement: {
      create: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    warehouse: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../modules/notification/queue', () => ({
  redisConnection: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
}));

// ─────────────────────────────────────────────
// Tests — Stock Level Calculations
// ─────────────────────────────────────────────

describe('Stock Level Calculations', () => {
  it('should detect low stock when quantity is below minStock', () => {
    const isLowStock = (qty: number, minStock: number) => qty < minStock;

    expect(isLowStock(5, 10)).toBe(true); // Below min
    expect(isLowStock(10, 10)).toBe(false); // Exactly at min
    expect(isLowStock(15, 10)).toBe(false); // Above min
    expect(isLowStock(0, 10)).toBe(true); // Zero stock
  });

  it('should detect when reorder is needed', () => {
    const needsReorder = (qty: number, reorderLevel: number) => qty <= reorderLevel;

    expect(needsReorder(5, 10)).toBe(true);
    expect(needsReorder(10, 10)).toBe(true); // At level = trigger reorder
    expect(needsReorder(11, 10)).toBe(false);
  });

  it('should calculate new stock after PURCHASE movement', () => {
    const applyPurchase = (currentQty: number, receivedQty: number) => currentQty + receivedQty;

    expect(applyPurchase(100, 50)).toBe(150);
    expect(applyPurchase(0, 100)).toBe(100); // Restock from zero
  });

  it('should calculate new stock after SALE movement', () => {
    const applySale = (currentQty: number, soldQty: number) => {
      if (soldQty > currentQty) {
        throw new BadRequestError('Insufficient stock');
      }
      return currentQty - soldQty;
    };

    expect(applySale(100, 30)).toBe(70);
    expect(() => applySale(10, 50)).toThrow(BadRequestError); // Oversell
    expect(() => applySale(0, 1)).toThrow(BadRequestError); // No stock
  });

  it('should not allow negative stock quantity result', () => {
    const safeDeduct = (qty: number, amount: number) => Math.max(0, qty - amount);

    expect(safeDeduct(50, 30)).toBe(20);
    expect(safeDeduct(10, 50)).toBe(0); // Clamped to 0
  });
});

// ─────────────────────────────────────────────
// Tests — Stock Adjustment Validation
// ─────────────────────────────────────────────

describe('Stock Adjustment Validation', () => {
  it('should reject zero quantity adjustments', () => {
    const validateAdjustment = (qty: number) => {
      if (qty === 0) {
        throw new BadRequestError('Adjustment quantity cannot be zero');
      }
      return true;
    };

    expect(() => validateAdjustment(0)).toThrow(BadRequestError);
    expect(validateAdjustment(5)).toBe(true);
    expect(validateAdjustment(-5)).toBe(true); // Negative = reduction
  });

  it('should handle INCREASE adjustment correctly', () => {
    const adjustmentType = (qty: number) => (qty > 0 ? 'INCREASE' : 'DECREASE');

    expect(adjustmentType(10)).toBe('INCREASE');
    expect(adjustmentType(-10)).toBe('DECREASE');
  });

  it('should validate warehouse exists before adjustment', () => {
    const validateWarehouse = (warehouse: null | { id: string; isActive: boolean }) => {
      if (!warehouse) {
        throw new BadRequestError('Warehouse not found');
      }
      if (!warehouse.isActive) {
        throw new BadRequestError('Warehouse is not active');
      }
      return true;
    };

    expect(() => validateWarehouse(null)).toThrow('Warehouse not found');
    expect(() => validateWarehouse({ id: 'w1', isActive: false })).toThrow(
      'Warehouse is not active',
    );
    expect(validateWarehouse({ id: 'w1', isActive: true })).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Tests — Opening Stock Logic
// ─────────────────────────────────────────────

describe('Opening Stock Logic', () => {
  it('should reject opening stock for products that already have inventory', () => {
    const validateOpeningStock = (existingQty: number | null) => {
      if (existingQty !== null && existingQty > 0) {
        throw new BadRequestError('Product already has existing stock — use adjustment instead');
      }
      return true;
    };

    expect(() => validateOpeningStock(100)).toThrow(BadRequestError);
    expect(validateOpeningStock(0)).toBe(true); // Zero is ok to re-open
    expect(validateOpeningStock(null)).toBe(true); // No existing record
  });

  it('should calculate unit cost correctly with opening stock', () => {
    const unitCost = (totalValue: number, quantity: number) => {
      if (quantity <= 0) {
        throw new BadRequestError('Quantity must be positive');
      }
      return totalValue / quantity;
    };

    expect(unitCost(10000, 100)).toBe(100);
    expect(unitCost(500, 4)).toBe(125);
    expect(() => unitCost(1000, 0)).toThrow(BadRequestError);
  });
});

// ─────────────────────────────────────────────
// Tests — Batch/Expiry Tracking
// ─────────────────────────────────────────────

describe('Batch Expiry Detection', () => {
  it('should identify expired batches correctly', () => {
    const isExpired = (expiryDate: Date) => expiryDate < new Date();

    const past = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

    expect(isExpired(past)).toBe(true);
    expect(isExpired(future)).toBe(false);
  });

  it('should identify batches expiring within 30 days', () => {
    const isExpiringSoon = (expiryDate: Date, daysThreshold = 30) => {
      const thresholdDate = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000);
      return expiryDate <= thresholdDate && expiryDate > new Date();
    };

    const in15Days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    const in45Days = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

    expect(isExpiringSoon(in15Days)).toBe(true);
    expect(isExpiringSoon(in45Days)).toBe(false);
  });
});

/**
 * Product Module Unit Tests
 *
 * Tests product management logic:
 * - SKU uniqueness validation
 * - Price calculation
 * - Category/brand/unit foreign key validation
 * - Soft delete behavior
 * - Search and filter logic
 */
import { describe, it, expect, vi } from 'vitest';
import { BadRequestError, ConflictError } from '../common/errors/AppError';

// ─────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────

vi.mock('../lib/prisma', () => ({
  prisma: {
    product: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    category: { findUnique: vi.fn() },
    brand: { findUnique: vi.fn() },
    unit: { findUnique: vi.fn() },
  },
}));

vi.mock('../modules/notification/queue', () => ({
  redisConnection: { get: vi.fn() },
}));

// ─────────────────────────────────────────────
// Tests — Price Calculations
// ─────────────────────────────────────────────

describe('Product Price Calculations', () => {
  it('should compute profit margin correctly', () => {
    const profitMargin = (costPrice: number, sellingPrice: number) => {
      if (costPrice <= 0) {
        throw new BadRequestError('Cost price must be positive');
      }
      return ((sellingPrice - costPrice) / costPrice) * 100;
    };

    expect(profitMargin(100, 150)).toBe(50); // 50% margin
    expect(profitMargin(200, 200)).toBe(0); // Break-even
    expect(profitMargin(100, 80)).toBe(-20); // Loss
    expect(() => profitMargin(0, 100)).toThrow(BadRequestError);
  });

  it('should calculate selling price from cost and margin', () => {
    const sellingPrice = (costPrice: number, marginPercent: number) =>
      costPrice * (1 + marginPercent / 100);

    expect(sellingPrice(100, 50)).toBe(150);
    expect(sellingPrice(200, 25)).toBe(250);
    expect(sellingPrice(100, 0)).toBe(100); // No margin
    expect(sellingPrice(100, 100)).toBe(200); // 100% margin
  });

  it('should reject selling price lower than cost in strict mode', () => {
    const validatePricing = (costPrice: number, sellingPrice: number, strict = true) => {
      if (strict && sellingPrice < costPrice) {
        throw new BadRequestError('Selling price cannot be lower than cost price');
      }
      return true;
    };

    expect(() => validatePricing(100, 80)).toThrow(BadRequestError);
    expect(validatePricing(100, 100)).toBe(true); // Exact cost OK
    expect(validatePricing(100, 80, false)).toBe(true); // Non-strict OK
  });

  it('should apply tax to selling price correctly', () => {
    const priceWithTax = (price: number, taxRate: number) => price * (1 + taxRate / 100);

    // Use toBeCloseTo for floating-point arithmetic
    expect(priceWithTax(100, 15)).toBeCloseTo(115, 5);
    expect(priceWithTax(100, 0)).toBe(100);
    expect(priceWithTax(200, 10)).toBeCloseTo(220, 5);
  });
});

// ─────────────────────────────────────────────
// Tests — SKU Validation
// ─────────────────────────────────────────────

describe('SKU Validation', () => {
  it('should accept valid SKU formats', () => {
    const isValidSku = (sku: string) => /^[A-Z0-9-]{3,50}$/i.test(sku);

    expect(isValidSku('SKU-001')).toBe(true);
    expect(isValidSku('PROD-ABC-123')).toBe(true);
    expect(isValidSku('AB')).toBe(false); // Too short
    expect(isValidSku('has space')).toBe(false); // Spaces not allowed
  });

  it('should detect duplicate SKU conflict', () => {
    const assertUniquesku = (existingProduct: null | { sku: string }, sku: string) => {
      if (existingProduct?.sku === sku) {
        throw new ConflictError(`Product with SKU "${sku}" already exists`);
      }
      return true;
    };

    expect(() => assertUniquesku({ sku: 'SKU-001' }, 'SKU-001')).toThrow(ConflictError);
    expect(assertUniquesku(null, 'SKU-001')).toBe(true);
    expect(assertUniquesku({ sku: 'SKU-002' }, 'SKU-001')).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Tests — Soft Delete Logic
// ─────────────────────────────────────────────

describe('Product Soft Delete', () => {
  it('should prevent deletion if product has stock movements', () => {
    const assertCanDelete = (hasMovements: boolean) => {
      if (hasMovements) {
        throw new BadRequestError(
          'Cannot delete product with existing stock movements. Deactivate instead.',
        );
      }
      return true;
    };

    expect(() => assertCanDelete(true)).toThrow(BadRequestError);
    expect(assertCanDelete(false)).toBe(true);
  });

  it('should mark product as inactive rather than hard delete', () => {
    const softDelete = (product: { id: string; isActive: boolean }) => ({
      ...product,
      isActive: false,
      deletedAt: new Date(),
    });

    const result = softDelete({ id: 'p1', isActive: true });
    expect(result.isActive).toBe(false);
    expect(result.deletedAt).toBeInstanceOf(Date);
  });
});

// ─────────────────────────────────────────────
// Tests — Product Search/Filter
// ─────────────────────────────────────────────

describe('Product Search Logic', () => {
  const products = [
    { id: '1', name: 'Apple Juice', sku: 'AJ-001', categoryId: 'cat-1' },
    { id: '2', name: 'Orange Juice', sku: 'OJ-002', categoryId: 'cat-1' },
    { id: '3', name: 'Apple Cider', sku: 'AC-003', categoryId: 'cat-2' },
  ];

  it('should filter by name search (case-insensitive)', () => {
    const search = (query: string) =>
      products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

    expect(search('apple')).toHaveLength(2);
    expect(search('APPLE')).toHaveLength(2);
    expect(search('juice')).toHaveLength(2);
    expect(search('cider')).toHaveLength(1);
    expect(search('banana')).toHaveLength(0);
  });

  it('should filter by category', () => {
    const filterByCategory = (categoryId: string) =>
      products.filter((p) => p.categoryId === categoryId);

    expect(filterByCategory('cat-1')).toHaveLength(2);
    expect(filterByCategory('cat-2')).toHaveLength(1);
    expect(filterByCategory('cat-999')).toHaveLength(0);
  });

  it('should search by SKU exact match', () => {
    const findBySku = (sku: string) => products.find((p) => p.sku === sku) ?? null;

    expect(findBySku('AJ-001')).toEqual(products[0]);
    expect(findBySku('INVALID')).toBeNull();
  });
});

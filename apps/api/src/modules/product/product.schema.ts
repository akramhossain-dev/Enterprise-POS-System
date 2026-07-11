import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

// ─────────────────────────────────────────────
// List / Filter Query
// ─────────────────────────────────────────────

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  companyId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  taxId: z.string().uuid().optional(),
});
export type ProductQuery = z.infer<typeof productQuerySchema>;

// ─────────────────────────────────────────────
// Search Query — name, SKU, barcode
// ─────────────────────────────────────────────

export const productSearchSchema = z.object({
  q: z.string().min(1, 'Search term is required'),
  companyId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ProductSearchQuery = z.infer<typeof productSearchSchema>;

// ─────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────

export const createProductSchema = z
  .object({
    companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
    unitId: z.string().uuid({ message: 'unitId must be a valid UUID' }),
    categoryId: z.string().uuid({ message: 'categoryId must be a valid UUID' }).optional(),
    brandId: z.string().uuid({ message: 'brandId must be a valid UUID' }).optional(),
    taxId: z.string().uuid({ message: 'taxId must be a valid UUID' }).optional(),
    name: z.string().min(1, 'Name is required').max(255),
    sku: z.string().max(100).optional(),
    barcode: z.string().max(100).optional(),
    description: z.string().max(5000).optional(),
    purchasePrice: z
      .number({ invalid_type_error: 'Purchase price must be a number' })
      .min(0, 'Purchase price must be >= 0'),
    sellingPrice: z
      .number({ invalid_type_error: 'Selling price must be a number' })
      .min(0, 'Selling price must be >= 0'),
    image: z.string().url().optional(),
  })
  .refine((data) => data.sellingPrice >= data.purchasePrice, {
    message: 'Selling price must be >= purchase price',
    path: ['sellingPrice'],
  });
export type CreateProductBody = z.infer<typeof createProductSchema>;

// ─────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────

export const updateProductSchema = z.object({
  unitId: z.string().uuid().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  brandId: z.string().uuid().nullable().optional(),
  taxId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(255).optional(),
  sku: z.string().max(100).nullable().optional(),
  barcode: z.string().max(100).nullable().optional(),
  description: z.string().max(5000).optional(),
  purchasePrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  image: z.string().url().nullable().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
});
export type UpdateProductBody = z.infer<typeof updateProductSchema>;

import { Decimal } from '@prisma/client/runtime/library';
import { ProductStatus, Status } from '@prisma/client';

// ─────────────────────────────────────────────
// Product Domain Types
// ─────────────────────────────────────────────

export interface ProductCategoryRef {
  id: string;
  name: string;
}

export interface ProductBrandRef {
  id: string;
  name: string;
}

export interface ProductUnitRef {
  id: string;
  name: string;
  shortName: string;
}

export interface ProductTaxRef {
  id: string;
  name: string;
  percentage: Decimal;
}

export interface ProductImageRef {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

export interface ProductResponse {
  id: string;
  companyId: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  purchasePrice: Decimal;
  sellingPrice: Decimal;
  image: string | null;
  status: ProductStatus;
  category: ProductCategoryRef | null;
  brand: ProductBrandRef | null;
  unit: ProductUnitRef;
  tax: ProductTaxRef | null;
  images: ProductImageRef[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSearchResult {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  sellingPrice: Decimal;
  status: ProductStatus;
  category: ProductCategoryRef | null;
  unit: ProductUnitRef;
}

export interface ProductListResult {
  products: ProductResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CatalogValidation {
  categoryStatus: Status | null;
  brandStatus: Status | null;
  unitStatus: Status | null;
  taxStatus: Status | null;
}

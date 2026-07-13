export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Unit {
  id: string;
  name: string;
  shortName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Tax {
  id: string;
  name: string;
  percentage: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  companyId: string;
  categoryId?: string | null;
  brandId?: string | null;
  unitId: string;
  taxId?: string | null;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  purchasePrice: number;
  sellingPrice: number;
  image?: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  brand?: Brand | null;
  unit?: Unit;
  tax?: Tax | null;
  images?: ProductImage[];
  stockSummary?: {
    totalQuantity: number;
    warehouses: Array<{
      warehouseId: string;
      warehouseName: string;
      availableQuantity: number;
    }>;
  };
}

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

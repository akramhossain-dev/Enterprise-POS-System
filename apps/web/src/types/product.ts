export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';

export interface Category {
  id: string;
  companyId: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  image?: string | null;
  icon?: string | null;
  displayOrder?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DELETED';
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    products: number;
  };
}

export interface Brand {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  country?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DELETED';
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    products: number;
  };
}

export interface Unit {
  id: string;
  companyId: string;
  name: string;
  shortName: string;
  description?: string | null;
  baseUnitId?: string | null;
  baseUnit?: Unit | null;
  derivedUnits?: Unit[];
  conversionRatio?: number | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DELETED';
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    products: number;
  };
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

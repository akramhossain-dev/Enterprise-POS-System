export type WarehouseStatus = 'ACTIVE' | 'INACTIVE';
export type BranchStatus = 'ACTIVE' | 'INACTIVE';
export type StorageType = 'DRY' | 'COLD' | 'HAZARDOUS' | 'CLIMATE_CONTROLLED';

export interface StorageLocation {
  id: string;
  warehouseId: string;
  warehouseName?: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  barcode: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseMetadata {
  capacity?: number | null; // In cubic meters or total storage units
  utilization?: number | null; // Percentage usage
  storageType?: StorageType | null;
  description?: string | null;
}

export interface Warehouse {
  id: string;
  companyId: string;
  branchId?: string | null;
  branch?: { id: string; name: string } | null;
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  managerName?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  status: WarehouseStatus;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  // Extended LocalStorage metadata fields
  metadata?: WarehouseMetadata | null;
}

export interface BranchMetadata {
  city?: string | null;
  country?: string | null;
  openingDate?: string | null;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status: BranchStatus;
  createdAt: string;
  updatedAt: string;

  // Custom metadata linked client-side
  metadata?: BranchMetadata | null;
}

export interface WarehouseFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: WarehouseStatus;
  branchId?: string;
  storageType?: StorageType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BranchFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: BranchStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

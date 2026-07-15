import type { Product } from './product';
import type { Warehouse, Branch } from './warehouse';

export type BatchStatus = 'ACTIVE' | 'EXPIRED' | 'DEPLETED' | 'QUARANTINE';

export type SerialStatus = 'AVAILABLE' | 'SOLD' | 'DAMAGED' | 'LOST' | 'RETURNED';

export type MovementType =
  | 'OPENING_STOCK'
  | 'PURCHASE'
  | 'PURCHASE_RETURN'
  | 'SALE'
  | 'SALE_RETURN'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'DAMAGE'
  | 'EXPIRED'
  | 'LOST'
  | 'MANUAL';

export interface Inventory {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouse: Warehouse;
  productId: string;
  product: Product;
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  minimumQuantity: number;
  reorderQuantity: number;
  maximumQuantity: number | null;
  averageCost: number;
  lastPurchasePrice: number;
  hasOpeningStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouse: Warehouse;
  productId: string;
  product: Product;
  batchNumber: string;
  manufacturingDate: string | null;
  expiryDate: string | null;
  quantity: number;
  status: BatchStatus;
  remarks: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerialNumber {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouse: Warehouse;
  productId: string;
  product: Product;
  serialNumber: string;
  status: SerialStatus;
  remarks: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedCustomer?: { id: string; name: string } | null;
  warrantyExpiry?: string | null;
}

export interface StockMovement {
  id: string;
  companyId: string;
  branchId: string | null;
  branch?: Branch | null;
  warehouseId: string;
  warehouse: Warehouse;
  productId: string;
  product: Product;
  referenceType: string | null;
  referenceId: string | null;
  movementType: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitCost: number | null;
  remarks: string | null;
  performedBy: string;
  createdAt: string;
}

export interface InventoryLedger {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouse: Warehouse;
  productId: string;
  product: Product;
  movementId: string;
  movement: StockMovement;
  runningQuantity: number;
  runningValue: number;
  createdAt: string;
}

export interface StockAlert {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouse: Warehouse;
  productId: string;
  product: Product;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRY_ALERT';
  status: 'ACTIVE' | 'RESOLVED' | 'SUPPRESSED';
  message: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface InventoryFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  warehouseId?: string;
  categoryId?: string;
  stockStatus?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BatchFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  warehouseId?: string;
  status?: BatchStatus;
  expiryStatus?: 'ALL' | 'EXPIRED' | 'EXPIRING_SOON' | 'SAFE';
}

export interface SerialFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  warehouseId?: string;
  status?: SerialStatus;
}

export interface StockHistoryFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  warehouseId?: string;
  movementType?: MovementType | 'ALL';
  startDate?: string;
  endDate?: string;
}

// ─────────────────────────────────────────────
// Operational Module Types — F6.3
// ─────────────────────────────────────────────

export type AdjustmentType = 'INCREASE' | 'DECREASE' | 'DAMAGE' | 'EXPIRED' | 'LOST';

export interface StockAdjustment {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouse: Warehouse;
  productId: string;
  product: Product;
  type: AdjustmentType;
  quantity: number;
  reason: string;
  remarks: string | null;
  approvedBy: string | null;
  createdBy: string;
  createdAt: string;
}

export type TransferStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface StockTransferItem {
  id: string;
  transferId: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface StockTransfer {
  id: string;
  companyId: string;
  fromWarehouseId: string;
  fromWarehouse: Warehouse;
  toWarehouseId: string;
  toWarehouse: Warehouse;
  status: TransferStatus;
  remarks: string | null;
  createdBy: string;
  approvedBy: string | null;
  items: StockTransferItem[];
  createdAt: string;
  updatedAt: string;
}

export type StockTakeStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface StockTakeItem {
  id: string;
  stockTakeId: string;
  productId: string;
  product: Product;
  systemQuantity: number;
  physicalQuantity: number | null;
  variance: number | null;
  remarks: string | null;
}

export type ReconciliationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Reconciliation {
  id: string;
  companyId: string;
  stockTakeId: string;
  stockTake?: StockTake | null;
  status: ReconciliationStatus;
  notes?: string | null;
  approvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockTake {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouse: Warehouse;
  title: string;
  status: StockTakeStatus;
  conductedBy: string | null;
  createdBy: string;
  items: StockTakeItem[];
  reconciliation: Reconciliation | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- Query Filters ----

export interface StockAdjustmentFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  warehouseId?: string;
  type?: AdjustmentType | 'ALL';
}

export interface StockTransferFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  status?: TransferStatus | 'ALL';
}

export interface StockTakeFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  warehouseId?: string;
  status?: StockTakeStatus | 'ALL';
}

export interface ReconciliationFilterParams {
  page?: number;
  limit?: number;
  status?: ReconciliationStatus | 'ALL';
}

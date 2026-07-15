import type { Product } from './product';
import type { Warehouse, Branch } from './warehouse';
import type { Supplier } from './supplier';

export type PurchaseOrderStatus =
  'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  product?: Product | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  branchId: string | null;
  branch?: Branch | null;
  warehouseId: string;
  warehouse?: Warehouse | null;
  supplierId: string;
  supplier?: Supplier | null;
  purchaseOrderNumber: string;
  orderDate: string;
  expectedDate: string | null;
  status: PurchaseOrderStatus;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  grandTotal: number;
  remarks: string | null;
  createdBy: string;
  approvedBy: string | null;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ---- PURCHASE REQUISITIONS (Client-Side Simulated) ----

export type PurchaseRequisitionStatus =
  'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CONVERTED';

export type PurchaseRequisitionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface PurchaseRequisitionItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseRequisition {
  id: string;
  title: string;
  requestedBy: string;
  department: string;
  requiredDate: string;
  priority: PurchaseRequisitionPriority;
  status: PurchaseRequisitionStatus;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  items: PurchaseRequisitionItem[];
  subtotal: number;
  notes: string | null;
  convertedPoId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- Query Filters ----

export interface PurchaseOrderFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  supplierId?: string;
  warehouseId?: string;
  branchId?: string;
  status?: PurchaseOrderStatus | 'ALL';
}

export interface PurchaseRequisitionFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  priority?: PurchaseRequisitionPriority | 'ALL';
  status?: PurchaseRequisitionStatus | 'ALL';
}

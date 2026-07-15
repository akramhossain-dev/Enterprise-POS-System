import type { Product } from './product';
import type { Warehouse, Branch } from './warehouse';
import type { Supplier } from './supplier';
import type { PurchaseOrder } from './purchase';

export type GoodsReceiveStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED';

export interface GoodsReceiveItem {
  id: string;
  goodsReceiveId: string;
  productId: string;
  product?: Product | null;
  quantity: number; // PO quantity ordered
  receivedQuantity: number; // actually received qty
  unitCost: number;
  batchNumber: string | null;
  expiryDate: string | null;
  serialRequired: boolean;
  total: number;
  createdAt: string;
}

export interface GoodsReceive {
  id: string;
  companyId: string;
  branchId: string | null;
  branch?: Branch | null;
  warehouseId: string;
  warehouse?: Warehouse | null;
  supplierId: string;
  supplier?: Supplier | null;
  purchaseOrderId: string | null;
  purchaseOrder?: PurchaseOrder | null;
  grnNumber: string;
  receiveDate: string;
  status: GoodsReceiveStatus;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  remarks: string | null;
  receivedBy: string;
  items: GoodsReceiveItem[];
  invoice?: SupplierInvoice | null;
  createdAt: string;
  updatedAt: string;
}

export type SupplierInvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface SupplierInvoice {
  id: string;
  goodsReceiveId: string;
  goodsReceive?: GoodsReceive | null;
  supplierId: string;
  supplier?: Supplier | null;
  invoiceNumber: string;
  invoiceDate: string;
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  status: SupplierInvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

// ---- INVOICE MATCHING (3-WAY MATCHING RESULTS) ----

export interface MatchingItemVariance {
  productId: string;
  productName: string;
  sku: string;
  poQty: number;
  grnQty: number;
  invoiceQty: number;
  poPrice: number;
  grnCost: number;
  invoicePrice: number;
  qtyVariance: number; // GRN received qty - PO ordered qty
  priceVariance: number; // Invoice unitPrice - PO unitPrice
  hasException: boolean;
}

export interface InvoiceMatchingResult {
  goodsReceiveId: string;
  grnNumber: string;
  purchaseOrderId: string | null;
  purchaseOrderNumber: string | null;
  supplierInvoiceId: string | null;
  supplierInvoiceNumber: string | null;
  isMatched: boolean;
  discrepancyCount: number;
  items: MatchingItemVariance[];
  varianceSummary: {
    qtyVarianceTotal: number; // aggregate qty variance
    priceVarianceTotal: number; // aggregate price variance
    totalDiscrepancyAmount: number; // financial delta
  };
}

// ---- Query Filters ----

export interface GoodsReceiveFilterParams {
  page?: number;
  limit?: number;
  companyId?: string;
  warehouseId?: string;
  supplierId?: string;
  purchaseOrderId?: string;
  status?: GoodsReceiveStatus | 'ALL';
  grnNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface SupplierInvoiceFilterParams {
  page?: number;
  limit?: number;
  supplierId?: string;
  status?: SupplierInvoiceStatus | 'ALL';
  invoiceNumber?: string;
}

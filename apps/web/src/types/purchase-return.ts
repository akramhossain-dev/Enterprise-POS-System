import type { Product } from './product';
import type { Warehouse } from './warehouse';
import type { Supplier } from './supplier';

export type PurchaseReturnStatus =
  'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export type PurchaseReturnReason =
  | 'DAMAGED'
  | 'EXPIRED'
  | 'WRONG_PRODUCT'
  | 'WRONG_QUANTITY'
  | 'QUALITY_ISSUE'
  | 'PACKAGING_DAMAGE'
  | 'SUPPLIER_ERROR'
  | 'MANUAL_CORRECTION'
  | 'OTHER';

export type PurchaseReturnMethod = 'CREDIT_NOTE' | 'REFUND' | 'REPLACEMENT';

export interface ApprovalTimelineItem {
  id: string;
  status: PurchaseReturnStatus;
  actionBy: string;
  actionDate: string;
  notes?: string | null;
}

export interface PurchaseReturnItem {
  id: string;
  purchaseReturnId: string;
  productId: string;
  productName: string;
  sku: string;
  product?: Product | null;
  orderedQty: number;
  receivedQty: number;
  returnQty: number;
  acceptedQty: number;
  rejectedQty: number;
  unitPrice: number;
  reason: PurchaseReturnReason;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  supplierId: string;
  supplier?: Supplier | null;
  warehouseId: string;
  warehouse?: Warehouse | null;
  referenceType: 'PO' | 'GRN' | 'INVOICE' | 'NONE';
  referencePoId?: string | null;
  referencePoNumber?: string | null;
  referenceGrnId?: string | null;
  referenceGrnNumber?: string | null;
  referenceInvoiceId?: string | null;
  referenceInvoiceNumber?: string | null;
  returnDate: string;
  reason: PurchaseReturnReason;
  status: PurchaseReturnStatus;
  returnMethod: PurchaseReturnMethod;
  notes?: string | null;
  attachments?: string[] | null;
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  items: PurchaseReturnItem[];
  approvalTimeline: ApprovalTimelineItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierCreditNote {
  id: string;
  creditNoteNumber: string;
  supplierId: string;
  supplier?: Supplier | null;
  referenceReturnId: string;
  referenceReturnNumber: string;
  creditAmount: number;
  status: 'DRAFT' | 'ISSUED' | 'VOID' | 'APPLIED';
  issueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierDebitNote {
  id: string;
  debitNoteNumber: string;
  supplierId: string;
  supplier?: Supplier | null;
  referenceReturnId: string;
  referenceReturnNumber: string;
  amount: number;
  status: 'DRAFT' | 'ISSUED' | 'VOID' | 'APPLIED';
  issueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseReturnFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  supplierId?: string;
  warehouseId?: string;
  status?: PurchaseReturnStatus | 'ALL';
  reason?: PurchaseReturnReason | 'ALL';
  dateFrom?: string;
  dateTo?: string;
}

export interface SupplierCreditNoteFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  supplierId?: string;
  status?: 'DRAFT' | 'ISSUED' | 'VOID' | 'APPLIED' | 'ALL';
}

export interface SupplierDebitNoteFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  supplierId?: string;
  status?: 'DRAFT' | 'ISSUED' | 'VOID' | 'APPLIED' | 'ALL';
}

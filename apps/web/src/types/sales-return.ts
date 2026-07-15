export type SalesReturnReason =
  | 'DAMAGED'
  | 'WRONG_PRODUCT'
  | 'DEFECTIVE'
  | 'EXPIRED'
  | 'CUSTOMER_CHANGED_MIND'
  | 'WARRANTY_CLAIM'
  | 'DUPLICATE_PURCHASE'
  | 'OTHER';

export type ProductCondition = 'NEW' | 'OPENED' | 'USED' | 'DAMAGED' | 'DEFECTIVE';

export interface SalesReturnItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantitySold: number;
  quantityReturned: number;
  condition: ProductCondition;
  reason: SalesReturnReason;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  warehouseId: string;
  returnDate: string;
  items: SalesReturnItem[];
  subtotal: number;
  discountAdjustments: number;
  taxAdjustments: number;
  refundAmount: number;
  refundMethod: 'CASH' | 'CARD' | 'MOBILE' | 'STORE_CREDIT' | 'GIFT_CARD';
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  refundStatus: 'PENDING' | 'REFUNDED' | 'FAILED';
  notes?: string;
}

export interface POSOrder {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  cashierName: string;
  totalAmount: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  status: 'PAID' | 'VOIDED' | 'PARTIALLY_RETURNED' | 'FULLY_RETURNED';
  completedAt: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface SalesRefund {
  id: string;
  returnId: string;
  returnNumber: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  refundMethod: string;
  status: 'PENDING' | 'REFUNDED' | 'FAILED';
  processedAt: string;
  cashierName: string;
}

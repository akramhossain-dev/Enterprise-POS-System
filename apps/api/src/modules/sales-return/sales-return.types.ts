import { SalesReturnStatus } from '@prisma/client';

export interface MappedSalesReturnItem {
  id: string;
  salesReturnId: string;
  saleItemId: string;
  productId: string;
  productName: string;
  productSku: string | null;
  quantity: string;
  unitPrice: string;
  total: string;
}

export interface MappedSalesReturn {
  id: string;
  companyId: string;
  branchId: string | null;
  warehouseId: string;
  customerId: string | null;
  customerName: string | null;
  saleId: string;
  saleInvoiceNumber: string;
  returnNumber: string;
  returnDate: string;
  status: SalesReturnStatus;
  subtotal: string;
  tax: string;
  discount: string;
  grandTotal: string;
  refundAmount: string;
  reason: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items?: MappedSalesReturnItem[];
}

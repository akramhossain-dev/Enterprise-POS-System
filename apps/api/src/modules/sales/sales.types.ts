import { SaleStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

export interface MappedSaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  productSku: string | null;
  productBarcode: string | null;
  quantity: string;
  unitPrice: string;
  discount: string;
  tax: string;
  total: string;
}

export interface MappedSale {
  id: string;
  companyId: string;
  branchId: string | null;
  warehouseId: string;
  customerId: string | null;
  customerName: string | null;
  customerCode: string | null;
  sessionId: string;
  invoiceNumber: string;
  saleDate: string;
  subtotal: string;
  discount: string;
  tax: string;
  grandTotal: string;
  paidAmount: string;
  dueAmount: string;
  paymentStatus: PaymentStatus;
  status: SaleStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items?: MappedSaleItem[];
}

export interface CheckoutPaymentDetails {
  paymentMethod: PaymentMethod;
  amount: number;
  reference?: string | null;
  transactionId?: string | null;
}

export interface CheckoutPayload {
  cartId: string;
  customerId?: string | null;
  paymentDetails?: CheckoutPaymentDetails | null;
}

export interface ReceiptPrintData {
  businessInfo: {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    taxNumber: string | null;
  };
  customerInfo: {
    name: string;
    code: string;
    phone: string | null;
  } | null;
  sale: {
    id: string;
    invoiceNumber: string;
    saleDate: string;
    status: SaleStatus;
    paymentStatus: PaymentStatus;
    subtotal: string;
    discount: string;
    tax: string;
    grandTotal: string;
    paidAmount: string;
    dueAmount: string;
  };
  items: {
    productName: string;
    sku: string | null;
    quantity: string;
    unitPrice: string;
    discount: string;
    tax: string;
    total: string;
  }[];
  payments: {
    paymentMethod: PaymentMethod;
    amount: string;
    reference: string | null;
    transactionId: string | null;
    paidAt: string;
  }[];
}

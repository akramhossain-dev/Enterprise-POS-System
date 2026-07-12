import { ReceiptType, VoucherType, PaymentMethod } from '@prisma/client';

export interface PaymentReceiptQuery {
  page?: number;
  limit?: number;
  dateFrom?: Date;
  dateTo?: Date;
  type?: ReceiptType;
  paymentMethod?: PaymentMethod;
  search?: string;
}

export interface PaymentVoucherQuery {
  page?: number;
  limit?: number;
  dateFrom?: Date;
  dateTo?: Date;
  type?: VoucherType;
  paymentMethod?: PaymentMethod;
  search?: string;
}

export interface MappedPaymentReceipt {
  id: string;
  receiptNumber: string;
  type: ReceiptType;
  amount: string;
  paymentMethod: PaymentMethod;
  reference: string | null;
  description: string | null;
  date: string;
  customer: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
  account: { id: string; accountCode: string; name: string };
  creator: { id: string; name: string };
  createdAt: string;
}

export interface MappedPaymentVoucher {
  id: string;
  voucherNumber: string;
  type: VoucherType;
  amount: string;
  paymentMethod: PaymentMethod;
  description: string | null;
  date: string;
  account: { id: string; accountCode: string; name: string };
  creator: { id: string; name: string };
  createdAt: string;
}

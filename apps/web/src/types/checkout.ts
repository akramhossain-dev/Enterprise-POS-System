export type POSPaymentMethod = 'CASH' | 'CARD' | 'MOBILE' | 'GIFT_CARD' | 'STORE_CREDIT';

export interface PaymentSplitItem {
  method: POSPaymentMethod;
  amount: number;
  reference?: string;
}

export interface CheckoutTransaction {
  id: string;
  invoiceNumber: string;
  cartName: string;
  customerId: string;
  customerName: string;
  itemsCount: number;
  subtotal: number;
  discount: number;
  discountType: 'PERCENT' | 'FIXED' | 'COUPON';
  discountCode?: string;
  tax: number;
  grandTotal: number;
  payments: PaymentSplitItem[];
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';
  changeAmount: number;
  cashierName: string;
  completedAt: string;
}

export interface CashDrawerLog {
  id: string;
  type: 'IN' | 'OUT';
  amount: number;
  notes: string;
  timestamp: string;
}

export interface CashDrawerShift {
  id: string;
  cashierName: string;
  openingBalance: number;
  currentBalance: number;
  shiftBalance: number; // Total POS checkouts in this shift
  openedAt: string;
  closedAt: string | null;
  logs: CashDrawerLog[];
}

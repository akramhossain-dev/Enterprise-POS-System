import type { Product } from './product';
import type { Customer } from './customer';

export interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  barcode: string | null;
  unitPrice: number;
  quantity: number;
  discount: number; // Discount amount per line item
  tax: number; // Tax percentage rate (e.g. 10 for 10%)
  notes?: string;
  product?: Product | null;
}

export interface Cart {
  id: string;
  name: string;
  items: CartItem[];
  customerId: string;
  customer?: Customer | null;
  globalDiscount: number; // Global discount amount
  globalTaxRate: number; // Global tax rate percentage (default: 10)
  warehouseId: string | null;
}

export interface HeldOrder {
  id: string;
  cart: Cart;
  heldAt: string;
  notes?: string;
}

export interface RecentOrder {
  id: string;
  cart: Cart;
  grandTotal: number;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE' | 'SPLIT';
  paymentAmount: number;
  changeAmount: number;
  completedAt: string;
}

export interface POSSettings {
  receiptPrinterWidth: 58 | 80;
  barcodeScanningAutoAdd: boolean;
  defaultWarehouseId: string;
  defaultCustomerId: string;
  cashDrawerTriggerCode: string;
}

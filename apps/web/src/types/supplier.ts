// ============================================================
// SUPPLIER MODULE — TYPES
// ============================================================

// ── Enums ─────────────────────────────────────────────────────

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type SupplierLedgerEntryType = 'PURCHASE' | 'PURCHASE_RETURN' | 'PAYMENT';

export type PaymentMethod = 'CASH' | 'BANK' | 'CARD' | 'MOBILE_BANKING' | 'OTHER';

// ── Address ───────────────────────────────────────────────────

export interface SupplierAddress {
  id: string;
  supplierId: string;
  label: string;
  country: string | null;
  state: string | null;
  city: string | null;
  area: string | null;
  postalCode: string | null;
  addressLine1: string;
  addressLine2: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Supplier ──────────────────────────────────────────────────

export interface Supplier {
  id: string;
  companyId: string;
  supplierCode: string;
  companyName: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  alternativePhone: string | null;
  website: string | null;
  taxNumber: string | null;
  /** Decimal serialised as string */
  creditLimit: string;
  openingBalance: string;
  currentBalance: string;
  status: SupplierStatus;
  notes: string | null;
  addresses: SupplierAddress[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ── Ledger ────────────────────────────────────────────────────

export interface SupplierLedgerEntry {
  id: string;
  companyId: string;
  supplierId: string;
  entryType: SupplierLedgerEntryType;
  amount: string;
  runningBalance: string;
  referenceId: string;
  referenceNo: string;
  description: string | null;
  createdAt: string;
}

// ── Balance ───────────────────────────────────────────────────

export interface SupplierBalance {
  supplierId: string;
  companyName: string;
  supplierCode: string;
  currentBalance: string;
  creditLimit: string;
}

// ── Payment ───────────────────────────────────────────────────

export interface SupplierPayment {
  id: string;
  companyId: string;
  supplierId: string;
  paymentNumber: string;
  amount: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Filter & Pagination Params ────────────────────────────────

export interface SupplierFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: SupplierStatus | '';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'companyName' | 'createdAt' | 'currentBalance';
  sortOrder?: 'asc' | 'desc';
}

export interface SupplierLedgerParams {
  page?: number;
  limit?: number;
  entryType?: SupplierLedgerEntryType | '';
  dateFrom?: string;
  dateTo?: string;
}

export interface SupplierPaymentParams {
  page?: number;
  limit?: number;
  supplierId?: string;
  paymentMethod?: PaymentMethod | '';
  dateFrom?: string;
  dateTo?: string;
}

// ── Create / Update Payloads ──────────────────────────────────

export interface CreateSupplierAddressPayload {
  label: string;
  country?: string;
  state?: string;
  city?: string;
  area?: string;
  postalCode?: string;
  addressLine1: string;
  addressLine2?: string;
  isDefault?: boolean;
}

export interface CreateSupplierPayload {
  companyId: string;
  companyName: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  alternativePhone?: string | null;
  website?: string | null;
  taxNumber?: string | null;
  creditLimit?: number;
  openingBalance?: number;
  status?: SupplierStatus;
  notes?: string | null;
  addresses?: CreateSupplierAddressPayload[];
}

export type UpdateSupplierPayload = Partial<Omit<CreateSupplierPayload, 'companyId' | 'addresses'>>;

export interface CreateSupplierPaymentPayload {
  companyId: string;
  supplierId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  reference?: string | null;
  notes?: string | null;
}

// ── Form Values ───────────────────────────────────────────────

export interface SupplierFormValues {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
  addressLine1: string;
  city: string;
  country: string;
  creditLimit: number;
  openingBalance: number;
  status: SupplierStatus;
  notes: string;
  logoUrl: string;
}

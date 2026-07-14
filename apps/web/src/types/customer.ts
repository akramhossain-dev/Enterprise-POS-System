// ============================================================
// CUSTOMER MODULE — TYPES
// ============================================================

// ── Enums ─────────────────────────────────────────────────────

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type CustomerGender = 'MALE' | 'FEMALE' | 'OTHER';

export type CustomerLedgerEntryType =
  'SALE' | 'PAYMENT' | 'RETURN' | 'ADJUSTMENT' | 'OPENING_BALANCE';

// ── Address ───────────────────────────────────────────────────

export interface CustomerAddress {
  id: string;
  customerId: string;
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

// ── Customer ──────────────────────────────────────────────────

export interface Customer {
  id: string;
  companyId: string;
  branchId: string | null;
  customerCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  alternativePhone: string | null;
  dateOfBirth: string | null;
  gender: CustomerGender | null;
  nationalId: string | null;
  taxNumber: string | null;
  /** Decimal serialised as string */
  creditLimit: string;
  openingBalance: string;
  currentBalance: string;
  loyaltyPoints: number;
  status: CustomerStatus;
  notes: string | null;
  addresses: CustomerAddress[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ── Ledger ────────────────────────────────────────────────────

export interface CustomerLedgerEntry {
  id: string;
  companyId: string;
  customerId: string;
  entryType: CustomerLedgerEntryType;
  amount: string;
  runningBalance: string;
  referenceId: string;
  referenceNo: string;
  description: string | null;
  createdAt: string;
}

// ── Balance ───────────────────────────────────────────────────

export interface CustomerBalance {
  customerId: string;
  fullName: string;
  customerCode: string;
  currentBalance: string;
  creditLimit: string;
}

// ── Filter & Pagination Params ────────────────────────────────

export interface CustomerFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: CustomerStatus | '';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'fullName' | 'createdAt' | 'currentBalance';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerLedgerParams {
  page?: number;
  limit?: number;
  entryType?: CustomerLedgerEntryType | '';
  dateFrom?: string;
  dateTo?: string;
}

// ── Create / Update Payloads ──────────────────────────────────

export interface CreateCustomerAddressPayload {
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

export interface CreateCustomerPayload {
  companyId: string;
  branchId?: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  alternativePhone?: string | null;
  dateOfBirth?: string | null;
  gender?: CustomerGender | null;
  nationalId?: string | null;
  taxNumber?: string | null;
  creditLimit?: number;
  openingBalance?: number;
  status?: CustomerStatus;
  notes?: string | null;
  addresses?: CreateCustomerAddressPayload[];
}

export type UpdateCustomerPayload = Partial<Omit<CreateCustomerPayload, 'companyId' | 'addresses'>>;

// ── Form Values ───────────────────────────────────────────────

export interface CustomerFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: CustomerGender | '';
  addressLine1: string;
  city: string;
  country: string;
  creditLimit: number;
  openingBalance: number;
  status: CustomerStatus;
  notes: string;
  avatarUrl: string;
}

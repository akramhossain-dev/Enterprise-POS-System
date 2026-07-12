// ─────────────────────────────────────────────
// Supplier Module — Types & Interfaces
// ─────────────────────────────────────────────

import { SupplierStatus } from '@prisma/client';

// ── Mapped response types ──────────────────────────────────────────────────────

export interface SupplierAddressRecord {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierRecord {
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
  creditLimit: string; // Decimal serialised as string
  openingBalance: string;
  currentBalance: string;
  status: SupplierStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  addresses: SupplierAddressRecord[];
}

// ── Repository-level filter & sort options ─────────────────────────────────────

export interface SupplierFilters {
  companyId?: string | undefined;
  status?: SupplierStatus | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

export interface SupplierSearchOptions {
  /** Free-text search across companyName, contactPerson, phone, email, supplierCode */
  q?: string | undefined;
}

export interface SupplierSortOptions {
  sortBy?: 'companyName' | 'createdAt' | 'currentBalance' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface SupplierPaginationOptions {
  page?: number | undefined;
  limit?: number | undefined;
}

export interface SupplierListOptions
  extends SupplierFilters, SupplierSearchOptions, SupplierSortOptions, SupplierPaginationOptions {}

// ── Audit hook payload ─────────────────────────────────────────────────────────

export interface SupplierAuditPayload {
  actorId: string;
  supplierId: string;
  supplierCode: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  changes?: Record<string, unknown>;
}

// ── Future placeholder types (DO NOT implement) ────────────────────────────────
export type SupplierPurchaseHistory = Record<string, never>; // Phase: Purchase
export type SupplierLedger = Record<string, never>; // Phase: Accounting
export type SupplierDue = Record<string, never>; // Phase: Accounting
export type SupplierPaymentHistory = Record<string, never>; // Phase: Accounting
export type SupplierStatement = Record<string, never>; // Phase: Reports
export type SupplierPerformance = Record<string, never>; // Phase: Analytics

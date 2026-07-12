// ─────────────────────────────────────────────
// Customer Module — Types & Interfaces
// ─────────────────────────────────────────────

import { CustomerStatus, Gender } from '@prisma/client';

// ── Lightweight record returned from the DB (mapped) ──────────────────────────

export interface CustomerRecord {
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
  dateOfBirth: Date | null;
  gender: Gender | null;
  nationalId: string | null;
  taxNumber: string | null;
  creditLimit: string; // Decimal serialised as string
  openingBalance: string;
  currentBalance: string;
  loyaltyPoints: number;
  status: CustomerStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  addresses: CustomerAddressRecord[];
}

export interface CustomerAddressRecord {
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
  createdAt: Date;
  updatedAt: Date;
}

// ── Repository-level filter & sort options ─────────────────────────────────────

export interface CustomerFilters {
  companyId?: string | undefined;
  branchId?: string | undefined;
  status?: CustomerStatus | undefined;
  /** ISO date string — filters createdAt >= dateFrom */
  dateFrom?: string | undefined;
  /** ISO date string — filters createdAt <= dateTo */
  dateTo?: string | undefined;
}

export interface CustomerSearchOptions {
  /** Free-text search across name, phone, email, customerCode */
  q?: string | undefined;
}

export interface CustomerSortOptions {
  sortBy?: 'fullName' | 'createdAt' | 'currentBalance' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface CustomerPaginationOptions {
  page?: number | undefined;
  limit?: number | undefined;
}

export interface CustomerListOptions
  extends CustomerFilters, CustomerSearchOptions, CustomerSortOptions, CustomerPaginationOptions {}

// ── Audit hook payload types ───────────────────────────────────────────────────
// These are placeholder interfaces for future Audit Log integration.

export interface CustomerAuditPayload {
  actorId: string;
  customerId: string;
  customerCode: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  changes?: Record<string, unknown>;
}

// ── Future placeholder interfaces ─────────────────────────────────────────────
// DO NOT implement these yet — reserved for future phases.

export type CustomerSalesHistory = Record<string, never>; // Phase: Sales

export type CustomerDue = Record<string, never>; // Phase: Accounting

export type CustomerPaymentHistory = Record<string, never>; // Phase: Accounting

export type CustomerLoyalty = Record<string, never>; // Phase: Loyalty

export type CustomerLedger = Record<string, never>; // Phase: Accounting

export type CustomerStatement = Record<string, never>; // Phase: Reports

export type CustomerNotes = Record<string, never>; // Phase: CRM

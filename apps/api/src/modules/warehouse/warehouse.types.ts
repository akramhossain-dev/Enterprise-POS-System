// ─────────────────────────────────────────────
// Warehouse Module — Types & Interfaces
// ─────────────────────────────────────────────

import { WarehouseStatus } from '@prisma/client';

// ── List options ───────────────────────────────────────────────────────────────

export interface WarehouseFilters {
  companyId?: string | undefined;
  branchId?: string | undefined;
  status?: WarehouseStatus | undefined;
}

export interface WarehouseSearchOptions {
  /** Free-text: name, code, city */
  q?: string | undefined;
}

export interface WarehouseSortOptions {
  sortBy?: 'name' | 'code' | 'createdAt' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface WarehousePaginationOptions {
  page?: number | undefined;
  limit?: number | undefined;
}

export interface WarehouseListOptions
  extends
    WarehouseFilters,
    WarehouseSearchOptions,
    WarehouseSortOptions,
    WarehousePaginationOptions {}

// ── Audit payload ──────────────────────────────────────────────────────────────

export interface WarehouseAuditPayload {
  actorId: string;
  warehouseId: string;
  warehouseCode: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  changes?: Record<string, unknown>;
}

// ── Future placeholders ────────────────────────────────────────────────────────
export type WarehouseStockSummary = Record<string, never>; // Phase: B7.2
export type WarehouseTransfer = Record<string, never>; // Phase: Transfer
export type WarehouseAdjustment = Record<string, never>; // Phase: Adjustment

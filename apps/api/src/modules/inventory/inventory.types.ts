// ─────────────────────────────────────────────
// Inventory Module — Types & Interfaces
// ─────────────────────────────────────────────

// ── List options ───────────────────────────────────────────────────────────────

export interface InventoryFilters {
  companyId?: string | undefined;
  warehouseId?: string | undefined;
  lowStock?: boolean | undefined; // availableQty < minimumQty
  outOfStock?: boolean | undefined; // availableQty === 0
}

export interface InventorySearchOptions {
  /** Search across product name, SKU, barcode */
  q?: string | undefined;
}

export interface InventorySortOptions {
  sortBy?: 'availableQuantity' | 'updatedAt' | 'createdAt' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface InventoryPaginationOptions {
  page?: number | undefined;
  limit?: number | undefined;
}

export interface InventoryListOptions
  extends
    InventoryFilters,
    InventorySearchOptions,
    InventorySortOptions,
    InventoryPaginationOptions {}

// ── Opening stock payload ──────────────────────────────────────────────────────

export interface OpeningStockInput {
  companyId: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  averageCost: number;
  minimumQuantity: number;
  reorderQuantity: number;
  maximumQuantity?: number | undefined;
}

// ── Audit payload ──────────────────────────────────────────────────────────────

export interface InventoryAuditPayload {
  actorId: string;
  inventoryId: string;
  productId: string;
  warehouseId: string;
  action: 'OPENING_STOCK' | 'STOCK_UPDATED';
  changes?: Record<string, unknown>;
}

// ── Future phase placeholders (DO NOT implement) ───────────────────────────────
export type StockMovement = Record<string, never>; // Phase: B7.2
export type StockAdjustment = Record<string, never>; // Phase: B7.2
export type StockTransfer = Record<string, never>; // Phase: Transfer
export type StockReturn = Record<string, never>; // Phase: Returns
export type StockReservation = Record<string, never>; // Phase: Sales

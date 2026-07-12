// ─────────────────────────────────────────────
// Stock Movement Module — Types
// ─────────────────────────────────────────────

import { MovementType } from '@prisma/client';

export interface StockMovementFilters {
  companyId?: string | undefined;
  warehouseId?: string | undefined;
  productId?: string | undefined;
  movementType?: MovementType | undefined;
  referenceType?: string | undefined;
  referenceId?: string | undefined;
  performedBy?: string | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
}

export interface StockMovementListOptions extends StockMovementFilters {
  q?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

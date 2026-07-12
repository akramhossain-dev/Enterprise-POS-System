import { POSSessionStatus } from '@prisma/client';

export interface MappedPOSSession {
  id: string;
  companyId: string;
  branchId: string | null;
  warehouseId: string;
  warehouseName: string;
  cashierId: string;
  cashierName: string;
  sessionNumber: string;
  openingCash: string;
  closingCash: string | null;
  status: POSSessionStatus;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
}

export interface POSProductSearchResult {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  sellingPrice: string;
  availableQuantity: string;
}

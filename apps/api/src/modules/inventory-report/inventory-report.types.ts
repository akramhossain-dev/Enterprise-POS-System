export interface InventoryReportItem {
  productId: string;
  productName: string;
  sku: string;
  warehouseName: string;
  availableQuantity: string;
  reservedQuantity: string;
  averageCost: string;
  inventoryValue: string;
}

export interface LowStockReportItem {
  productId: string;
  productName: string;
  sku: string;
  currentQuantity: string;
  minimumQuantity: string;
  warehouseName: string;
}

export interface StockMovementReportItem {
  id: string;
  date: string;
  productName: string;
  sku: string;
  warehouseName: string;
  movementType: string;
  quantity: string;
  user: string;
}

export interface BatchReportItem {
  batchNumber: string;
  productName: string;
  quantity: string;
  mfgDate: string;
  expiryDate: string;
}

export interface ExpiryReportItem {
  batchNumber: string;
  productName: string;
  expiryDate: string;
  status: 'EXPIRED' | 'EXPIRING_SOON' | 'ACTIVE';
}

export interface WarehouseReportItem {
  warehouseName: string;
  totalProducts: number;
  totalQuantity: string;
  inventoryValue: string;
}

export interface WarehouseValuation {
  warehouseId: string;
  warehouseName: string;
  value: string;
}

export interface InventoryValuationReport {
  inventoryValue: string;
  warehouseValue: WarehouseValuation[];
  overallValue: string;
}

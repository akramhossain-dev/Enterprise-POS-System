export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface ExecutiveKpiSummary {
  revenue: number;
  revenueChange: number;
  grossProfit: number;
  grossProfitChange: number;
  netProfit: number;
  netProfitChange: number;
  avgOrderValue: number;
  avgOrderValueChange: number;
  conversionRate: number;
  conversionRateChange: number;
  customerGrowth: number;
  customerGrowthChange: number;
  inventoryTurnover: number;
  inventoryTurnoverChange: number;
  purchaseCost: number;
  purchaseCostChange: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  secondaryInfo?: string;
  quantity?: number;
  amount: number;
}

export interface BranchPerformance {
  branchId: string;
  branchName: string;
  revenue: number;
  salesCount: number;
  profit: number;
}

export interface WarehousePerformance {
  warehouseId: string;
  warehouseName: string;
  stockValue: number;
  itemCount: number;
  occupancyPercentage: number;
}

export interface WidgetState {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  minW?: number;
  minH?: number;
}

export interface SalesAnalyticsData {
  totalSales: number;
  salesGrowth: number;
  salesTrend: TimeSeriesPoint[];
  salesByCategory: { name: string; value: number }[];
  salesByBrand: { name: string; value: number }[];
  salesByPaymentMethod: { name: string; value: number }[];
  salesByBranch: { name: string; value: number }[];
  mostReturnedProducts: LeaderboardEntry[];
}

export interface PurchaseAnalyticsData {
  totalPurchases: number;
  purchaseGrowth: number;
  purchaseTrend: TimeSeriesPoint[];
  purchaseBySupplier: { name: string; value: number }[];
  supplierCredits: number;
  debitNotesCount: number;
}

export interface InventoryAnalyticsData {
  totalStockValue: number;
  lowStockItemsCount: number;
  inventoryTrend: TimeSeriesPoint[];
  inventoryByWarehouse: { name: string; value: number }[];
  turnoverRatio: number;
}

export interface CustomerAnalyticsData {
  totalCustomers: number;
  customerGrowthTrend: TimeSeriesPoint[];
  customerSegmentation: { name: string; value: number }[];
  topCustomers: LeaderboardEntry[];
}

export interface SupplierAnalyticsData {
  totalSuppliers: number;
  topSuppliers: LeaderboardEntry[];
  purchaseBySupplier: { name: string; value: number }[];
}

export interface EmployeeAnalyticsData {
  totalEmployees: number;
  topEmployees: LeaderboardEntry[];
}

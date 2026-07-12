export interface DashboardOverview {
  totalSales: string;
  totalPurchase: string;
  totalRevenue: string;
  totalExpense: string;
  netProfit: string;
  totalCustomers: number;
  totalSuppliers: number;
  totalProducts: number;
  lowStockItemsCount: number;
}

export interface SalesSummary {
  todaySales: string;
  yesterdaySales: string;
  thisWeekSales: string;
  thisMonthSales: string;
  thisYearSales: string;
}

export interface SalesTrendItem {
  date: string;
  salesAmount: string;
  numberOfOrders: number;
}

export interface PurchaseSummary {
  totalPurchase: number;
  pendingPurchase: number;
  completedPurchase: number;
  purchaseAmount: string;
}

export interface WarehouseWiseStockItem {
  warehouseId: string;
  warehouseName: string;
  totalStock: string;
}

export interface InventorySummary {
  totalProducts: number;
  totalStockValue: string;
  lowStockCount: number;
  outOfStockCount: number;
  warehouseWiseStock: WarehouseWiseStockItem[];
}

export interface TopCustomerItem {
  customerId: string;
  customerName: string;
  totalPurchase: string;
}

export interface CustomerSummary {
  totalCustomers: number;
  newCustomers: number;
  topCustomers: TopCustomerItem[];
  customerDueAmount: string;
}

export interface TopSupplierItem {
  supplierId: string;
  companyName: string;
  totalPurchase: string;
}

export interface SupplierSummary {
  totalSuppliers: number;
  supplierDue: string;
  topSuppliers: TopSupplierItem[];
}

export interface FinancialAnalyticsSummary {
  totalIncome: string;
  totalExpense: string;
  profit: string;
  cashBalance: string;
  bankBalance: string;
}

export interface TopProductItem {
  productId: string;
  productName: string;
  quantitySold: string;
  revenue: string;
}

export interface TopCustomerPaymentItem {
  customerId: string;
  customerName: string;
  totalPurchase: string;
  totalPayment: string;
}

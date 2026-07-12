export interface DetailedSalesReportItem {
  invoiceNumber: string;
  date: string;
  customerName: string;
  products: string;
  quantity: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  paymentStatus: string;
}

export interface SalesSummaryReport {
  totalOrders: number;
  totalQuantitySold: string;
  grossSales: string;
  discount: string;
  tax: string;
  netSales: string;
}

export interface DetailedPurchaseReportItem {
  purchaseNumber: string;
  supplierName: string;
  date: string;
  products: string;
  quantity: string;
  amount: string;
  status: string;
}

export interface ProfitAnalysisReport {
  salesRevenue: string;
  productCost: string;
  discount: string;
  grossProfit: string;
}

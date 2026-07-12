export interface ProductSalesReportItem {
  productId: string;
  productName: string;
  quantitySold: string;
  revenue: string;
  profitMargin: string;
}

export interface CustomerSalesReportItem {
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalPurchaseAmount: string;
  totalPaid: string;
  dueAmount: string;
}

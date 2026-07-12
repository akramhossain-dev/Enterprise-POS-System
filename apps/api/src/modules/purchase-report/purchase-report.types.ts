export interface PurchaseSummaryReport {
  totalPurchase: number;
  totalItems: string;
  totalSuppliers: number;
  averagePurchaseValue: string;
}

export interface SupplierPurchaseReportItem {
  supplierId: string;
  companyName: string;
  purchaseCount: number;
  purchaseAmount: string;
  dueAmount: string;
}

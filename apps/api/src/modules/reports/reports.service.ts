import { prisma } from '../../lib/prisma';
import { getOrSetCache } from '../analytics/analytics.service';
import { aggregateSalesItems } from './reports.repository';
import { ReportsFilter } from './reports.schema';
import {
  DetailedSalesReportItem,
  SalesSummaryReport,
  DetailedPurchaseReportItem,
  ProfitAnalysisReport,
} from './reports.types';
import {
  getDetailedSales,
  getSalesSummary,
  getProductSales,
  getCustomerSales,
} from '../sales-report/sales-report.service';
import {
  getDetailedPurchases,
  getPurchaseSummary,
  getSupplierPurchases,
} from '../purchase-report/purchase-report.service';
import {
  ProductSalesReportItem,
  CustomerSalesReportItem,
} from '../sales-report/sales-report.types';
import {
  PurchaseSummaryReport,
  SupplierPurchaseReportItem,
} from '../purchase-report/purchase-report.types';
import {
  getInventoryReport,
  getLowStockReport,
  getOutOfStockReport,
  getStockMovementReport,
  getBatchReport,
  getExpiryReport,
  getWarehouseReport,
  getInventoryValuation,
} from '../inventory-report/inventory-report.service';
import {
  getProfitLossReport,
  getGeneralLedgerReport,
  getTrialBalanceReport,
} from '../financial-report/report.service';
import {
  InventoryReportItem,
  LowStockReportItem,
  StockMovementReportItem,
  BatchReportItem,
  ExpiryReportItem,
  WarehouseReportItem,
  InventoryValuationReport,
} from '../inventory-report/inventory-report.types';
import {
  ProfitLossReport,
  GeneralLedgerRow,
  TrialBalanceRow,
} from '../financial-report/report.types';
import { BadRequestError } from '../../common/errors/AppError';
import { Prisma } from '@prisma/client';

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new BadRequestError('User is not linked to any company/employee record');
  }
  return employee.companyId;
}

export async function getDetailedSalesReport(
  userId: string,
  filter: ReportsFilter,
): Promise<{ items: DetailedSalesReportItem[]; total: number }> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `detailed_sales_${companyId}_${JSON.stringify(filter)}`;

  return getOrSetCache(cacheKey, () => getDetailedSales(companyId, filter));
}

export async function getSalesSummaryReport(
  userId: string,
  filter: ReportsFilter,
): Promise<SalesSummaryReport> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `sales_summary_report_${companyId}_${JSON.stringify(filter)}`;

  return getOrSetCache(cacheKey, () => getSalesSummary(companyId, filter));
}

export async function getProductSalesReport(
  userId: string,
  filter: ReportsFilter,
): Promise<{ items: ProductSalesReportItem[]; total: number }> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `product_sales_${companyId}_${JSON.stringify(filter)}`;

  return getOrSetCache(cacheKey, () => getProductSales(companyId, filter));
}

export async function getCustomerSalesReport(
  userId: string,
  filter: ReportsFilter,
): Promise<{ items: CustomerSalesReportItem[]; total: number }> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `customer_sales_${companyId}_${JSON.stringify(filter)}`;

  return getOrSetCache(cacheKey, () => getCustomerSales(companyId, filter));
}

export async function getDetailedPurchasesReport(
  userId: string,
  filter: ReportsFilter,
): Promise<{ items: DetailedPurchaseReportItem[]; total: number }> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `detailed_purchases_${companyId}_${JSON.stringify(filter)}`;

  return getOrSetCache(cacheKey, () => getDetailedPurchases(companyId, filter));
}

export async function getPurchaseSummaryReport(
  userId: string,
  filter: ReportsFilter,
): Promise<PurchaseSummaryReport> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `purchase_summary_report_${companyId}_${JSON.stringify(filter)}`;

  return getOrSetCache(cacheKey, () => getPurchaseSummary(companyId, filter));
}

export async function getSupplierPurchasesReport(
  userId: string,
  filter: ReportsFilter,
): Promise<{ items: SupplierPurchaseReportItem[]; total: number }> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `supplier_purchases_${companyId}_${JSON.stringify(filter)}`;

  return getOrSetCache(cacheKey, () => getSupplierPurchases(companyId, filter));
}

export async function getProfitAnalysisReport(
  userId: string,
  filter: ReportsFilter,
): Promise<ProfitAnalysisReport> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `profit_analysis_${companyId}_${JSON.stringify(filter)}`;

  return getOrSetCache(cacheKey, async () => {
    const saleItems = await aggregateSalesItems(companyId, filter);

    let grossRevenue = new Prisma.Decimal(0);
    let productCost = new Prisma.Decimal(0);
    let lineDiscounts = new Prisma.Decimal(0);
    const saleIds = new Set<string>();

    for (const item of saleItems) {
      saleIds.add(item.saleId);
      const qty = item.quantity;
      const price = item.unitPrice;
      const cost = item.product.purchasePrice;

      grossRevenue = grossRevenue.add(qty.mul(price));
      productCost = productCost.add(qty.mul(cost));
      lineDiscounts = lineDiscounts.add(item.discount);
    }

    // Get global discounts for distinct sales
    const sales = await prisma.sale.findMany({
      where: {
        id: { in: Array.from(saleIds) },
      },
      select: {
        discount: true,
      },
    });

    let globalSalesDiscount = new Prisma.Decimal(0);
    for (const s of sales) {
      globalSalesDiscount = globalSalesDiscount.add(s.discount);
    }

    const totalDiscount = lineDiscounts.add(globalSalesDiscount);
    const grossProfit = grossRevenue.sub(productCost).sub(totalDiscount);

    return {
      salesRevenue: grossRevenue.toFixed(2),
      productCost: productCost.toFixed(2),
      discount: totalDiscount.toFixed(2),
      grossProfit: grossProfit.toFixed(2),
    };
  });
}

export async function getInventoryReportData(
  userId: string,
  filter: ReportsFilter,
): Promise<{ items: InventoryReportItem[]; total: number }> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `inventory_report_${companyId}_${JSON.stringify(filter)}`;
  return getOrSetCache(cacheKey, () => getInventoryReport(companyId, filter));
}

export async function getLowStockReportData(
  userId: string,
  filter: ReportsFilter,
): Promise<{ items: LowStockReportItem[]; total: number }> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `low_stock_report_${companyId}_${JSON.stringify(filter)}`;
  return getOrSetCache(cacheKey, () => getLowStockReport(companyId, filter));
}

export async function getOutOfStockReportData(
  userId: string,
  filter: ReportsFilter,
): Promise<{ items: LowStockReportItem[]; total: number }> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `out_of_stock_report_${companyId}_${JSON.stringify(filter)}`;
  return getOrSetCache(cacheKey, () => getOutOfStockReport(companyId, filter));
}

export async function getStockMovementReportData(
  userId: string,
  filter: ReportsFilter,
): Promise<{ items: StockMovementReportItem[]; total: number }> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `stock_movement_report_${companyId}_${JSON.stringify(filter)}`;
  return getOrSetCache(cacheKey, () => getStockMovementReport(companyId, filter));
}

export async function getBatchReportData(
  userId: string,
  filter: ReportsFilter,
): Promise<{ items: BatchReportItem[]; total: number }> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `batch_report_${companyId}_${JSON.stringify(filter)}`;
  return getOrSetCache(cacheKey, () => getBatchReport(companyId, filter));
}

export async function getExpiryReportData(
  userId: string,
  filter: ReportsFilter,
): Promise<{ items: ExpiryReportItem[]; total: number }> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `expiry_report_${companyId}_${JSON.stringify(filter)}`;
  return getOrSetCache(cacheKey, () => getExpiryReport(companyId, filter));
}

export async function getWarehouseReportData(
  userId: string,
  filter: ReportsFilter,
): Promise<{ items: WarehouseReportItem[]; total: number }> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `warehouse_report_${companyId}_${JSON.stringify(filter)}`;
  return getOrSetCache(cacheKey, () => getWarehouseReport(companyId, filter));
}

export async function getInventoryValuationReportData(
  userId: string,
  filter: ReportsFilter,
): Promise<InventoryValuationReport> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `inventory_valuation_${companyId}_${JSON.stringify(filter)}`;
  return getOrSetCache(cacheKey, () => getInventoryValuation(companyId, filter));
}

export async function getGeneralLedgerReportData(
  userId: string,
  accountId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<GeneralLedgerRow[]> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `general_ledger_${companyId}_${accountId}_${String(startDate?.getTime())}_${String(endDate?.getTime())}`;
  return getOrSetCache(cacheKey, () =>
    getGeneralLedgerReport(userId, accountId, startDate, endDate),
  );
}

export async function getTrialBalanceReportData(userId: string): Promise<TrialBalanceRow[]> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `trial_balance_report_${companyId}`;
  return getOrSetCache(cacheKey, () => getTrialBalanceReport(userId));
}

export async function getProfitLossReportData(
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<ProfitLossReport> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `profit_loss_report_${companyId}_${String(startDate?.getTime())}_${String(endDate?.getTime())}`;
  return getOrSetCache(cacheKey, () => getProfitLossReport(userId, startDate, endDate));
}

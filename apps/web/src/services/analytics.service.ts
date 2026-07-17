import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type {
  ExecutiveKpiSummary,
  SalesAnalyticsData,
  PurchaseAnalyticsData,
  InventoryAnalyticsData,
  CustomerAnalyticsData,
  SupplierAnalyticsData,
  BranchPerformance,
  WarehousePerformance,
  EmployeeAnalyticsData,
  TimeSeriesPoint,
} from '@/types/analytics';

export interface AnalyticsFilterParams {
  [key: string]: string | number | boolean | undefined;
  startDate?: string;
  endDate?: string;
  branchId?: string;
  warehouseId?: string;
  categoryId?: string;
}

class AnalyticsService extends ApiClient {
  async getExecutiveKpis(filters?: AnalyticsFilterParams): Promise<ExecutiveKpiSummary> {
    const response = await this.get<any>('/dashboard/overview', filters);
    const data = response.data;

    return {
      revenue: parseFloat(data.totalRevenue || '0'),
      revenueChange: 0,
      grossProfit: parseFloat(data.totalRevenue || '0') - parseFloat(data.totalExpense || '0'),
      grossProfitChange: 0,
      netProfit: parseFloat(data.netProfit || '0'),
      netProfitChange: 0,
      avgOrderValue:
        parseFloat(data.totalSales || '0') > 0
          ? parseFloat(data.totalRevenue || '0') / parseFloat(data.totalSales || '1')
          : 0,
      avgOrderValueChange: 0,
      conversionRate: 0,
      conversionRateChange: 0,
      customerGrowth: 0,
      customerGrowthChange: 0,
      inventoryTurnover: 0,
      inventoryTurnoverChange: 0,
      purchaseCost: parseFloat(data.totalPurchase || '0'),
      purchaseCostChange: 0,
    };
  }

  async getSalesAnalytics(filters?: AnalyticsFilterParams): Promise<SalesAnalyticsData> {
    const summaryRes = await this.get<any>('/dashboard/sales-summary', filters);
    const trendRes = await this.get<any>('/dashboard/sales-trend', filters);

    const sData = summaryRes.data;
    const tData = trendRes.data || [];

    const salesTrend: TimeSeriesPoint[] = tData.map((t: any) => ({
      date: t.date,
      value: parseFloat(t.salesAmount || '0'),
    }));

    return {
      totalSales: parseFloat(sData.thisMonthSales || '0'),
      salesGrowth: 0,
      salesTrend: salesTrend,
      salesByCategory: (sData.salesByCategory || []).map((c: any) => ({
        name: c.categoryName,
        value: parseFloat(c.salesAmount || '0'),
      })),
      salesByBrand: [],
      salesByPaymentMethod: [],
      salesByBranch: [],
      mostReturnedProducts: [],
    };
  }

  async getPurchaseAnalytics(filters?: AnalyticsFilterParams): Promise<PurchaseAnalyticsData> {
    const response = await this.get<any>('/dashboard/purchase-summary', filters);
    const data = response.data;

    return {
      totalPurchases: parseFloat(data.purchaseAmount || '0'),
      purchaseGrowth: 0,
      purchaseTrend: [],
      purchaseBySupplier: [],
      supplierCredits: 0,
      debitNotesCount: 0,
    };
  }

  async getInventoryAnalytics(filters?: AnalyticsFilterParams): Promise<InventoryAnalyticsData> {
    const response = await this.get<any>('/dashboard/inventory-summary', filters);
    const data = response.data;
    const warehouseStock = (data.warehouseWiseStock || []).map((w: any) => ({
      name: w.warehouseName,
      value: parseFloat(w.totalStock || '0'),
    }));

    return {
      totalStockValue: parseFloat(data.totalStockValue || '0'),
      lowStockItemsCount: data.lowStockCount || 0,
      inventoryTrend: [],
      inventoryByWarehouse: warehouseStock,
      turnoverRatio: 0,
    };
  }

  async getCustomerAnalytics(filters?: AnalyticsFilterParams): Promise<CustomerAnalyticsData> {
    const response = await this.get<any>('/dashboard/customer-summary', filters);
    const data = response.data;
    const topCust = (data.topCustomers || []).map((c: any) => ({
      id: c.customerId,
      name: c.customerName,
      amount: parseFloat(c.totalPurchase || '0'),
    }));

    return {
      totalCustomers: data.totalCustomers || 0,
      customerGrowthTrend: [],
      customerSegmentation: [],
      topCustomers: topCust,
    };
  }

  async getSupplierAnalytics(filters?: AnalyticsFilterParams): Promise<SupplierAnalyticsData> {
    const response = await this.get<any>('/dashboard/supplier-summary', filters);
    const data = response.data;
    const topSupp = (data.topSuppliers || []).map((s: any) => ({
      id: s.supplierId,
      name: s.companyName,
      amount: parseFloat(s.totalPurchase || '0'),
    }));

    return {
      totalSuppliers: data.totalSuppliers || 0,
      topSuppliers: topSupp,
      purchaseBySupplier: topSupp.map((s: any) => ({ name: s.name, value: s.amount })),
    };
  }

  async getBranchPerformance(filters?: AnalyticsFilterParams): Promise<BranchPerformance[]> {
    const response = await this.get<BranchPerformance[]>(
      apiConfig.endpoints.analytics.branches,
      filters,
    );
    return response.data;
  }

  async getWarehousePerformance(filters?: AnalyticsFilterParams): Promise<WarehousePerformance[]> {
    const response = await this.get<WarehousePerformance[]>(
      apiConfig.endpoints.analytics.warehouses,
      filters,
    );
    return response.data;
  }

  async getEmployeeAnalytics(filters?: AnalyticsFilterParams): Promise<EmployeeAnalyticsData> {
    const response = await this.get<EmployeeAnalyticsData>(
      apiConfig.endpoints.analytics.employees,
      filters,
    );
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();

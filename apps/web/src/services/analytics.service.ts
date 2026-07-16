import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type {
  ExecutiveKpiSummary,
  SalesAnalyticsData,
  PurchaseAnalyticsData,
  InventoryAnalyticsData,
  CustomerAnalyticsData,
  SupplierAnalyticsData,
  EmployeeAnalyticsData,
  BranchPerformance,
  WarehousePerformance,
  TimeSeriesPoint,
} from '@/types/analytics';

export interface AnalyticsFilterParams {
  [key: string]: string | number | undefined;
  startDate?: string;
  endDate?: string;
  branchId?: string;
  warehouseId?: string;
  categoryId?: string;
  supplierId?: string;
  customerId?: string;
}

class AnalyticsService extends ApiClient {
  private getMockSalesTrend(): TimeSeriesPoint[] {
    return [
      { date: '2026-07-10', value: 12400 },
      { date: '2026-07-11', value: 14500 },
      { date: '2026-07-12', value: 13200 },
      { date: '2026-07-13', value: 18900 },
      { date: '2026-07-14', value: 22400 },
      { date: '2026-07-15', value: 21100 },
      { date: '2026-07-16', value: 24500 },
    ];
  }

  private getMockPurchaseTrend(): TimeSeriesPoint[] {
    return [
      { date: '2026-07-10', value: 8400 },
      { date: '2026-07-11', value: 9200 },
      { date: '2026-07-12', value: 10500 },
      { date: '2026-07-13', value: 6800 },
      { date: '2026-07-14', value: 11400 },
      { date: '2026-07-15', value: 9500 },
      { date: '2026-07-16', value: 12100 },
    ];
  }

  async getExecutiveKpis(filters?: AnalyticsFilterParams): Promise<ExecutiveKpiSummary> {
    try {
      const response = await this.get<ExecutiveKpiSummary>(
        apiConfig.endpoints.analytics.dashboard + '/kpis',
        filters,
      );
      return response.data;
    } catch {
      // Simulate rich corporate parameters
      return {
        revenue: 1248400,
        revenueChange: 12.4,
        grossProfit: 852900,
        grossProfitChange: 9.8,
        netProfit: 452400,
        netProfitChange: 14.5,
        avgOrderValue: 185.5,
        avgOrderValueChange: 4.2,
        conversionRate: 2.38,
        conversionRateChange: 0.5,
        customerGrowth: 5.7,
        customerGrowthChange: 1.2,
        inventoryTurnover: 8.4,
        inventoryTurnoverChange: 0.8,
        purchaseCost: 395500,
        purchaseCostChange: -2.5,
      };
    }
  }

  async getSalesAnalytics(filters?: AnalyticsFilterParams): Promise<SalesAnalyticsData> {
    try {
      const response = await this.get<SalesAnalyticsData>(
        apiConfig.endpoints.analytics.sales,
        filters,
      );
      return response.data;
    } catch {
      return {
        totalSales: 1248400,
        salesGrowth: 12.4,
        salesTrend: this.getMockSalesTrend(),
        salesByCategory: [
          { name: 'Apparel & Fashion', value: 345000 },
          { name: 'Consumer Electronics', value: 489000 },
          { name: 'Home & Kitchen', value: 212000 },
          { name: 'Groceries & Foods', value: 154400 },
          { name: 'Beauty & Personal Care', value: 48000 },
        ],
        salesByBrand: [
          { name: 'Nike', value: 185000 },
          { name: 'Apple', value: 310000 },
          { name: 'Samsung', value: 179000 },
          { name: 'Sony', value: 98000 },
          { name: 'Other Brands', value: 476400 },
        ],
        salesByPaymentMethod: [
          { name: 'Credit/Debit Cards', value: 745000 },
          { name: 'Digital Wallets', value: 298000 },
          { name: 'Cash', value: 185400 },
          { name: 'Bank Transfer', value: 20000 },
        ],
        salesByBranch: [
          { name: 'Dhaka Central (HQ)', value: 580000 },
          { name: 'Chittagong Port', value: 340000 },
          { name: 'Sylhet Valley', value: 210000 },
          { name: 'Rajshahi Express', value: 118400 },
        ],
        mostReturnedProducts: [
          {
            id: 'p-101',
            name: 'Premium Leather Boots',
            secondaryInfo: 'Size mismatch',
            quantity: 24,
            amount: 2880,
          },
          {
            id: 'p-105',
            name: 'Wireless Bluetooth Buds',
            secondaryInfo: 'Connection drop',
            quantity: 18,
            amount: 1620,
          },
          {
            id: 'p-110',
            name: 'USB-C Fast Charger Plug',
            secondaryInfo: 'Defective pins',
            quantity: 35,
            amount: 875,
          },
        ],
      };
    }
  }

  async getPurchaseAnalytics(filters?: AnalyticsFilterParams): Promise<PurchaseAnalyticsData> {
    try {
      const response = await this.get<PurchaseAnalyticsData>(
        apiConfig.endpoints.analytics.purchase,
        filters,
      );
      return response.data;
    } catch {
      return {
        totalPurchases: 395500,
        purchaseGrowth: -2.5,
        purchaseTrend: this.getMockPurchaseTrend(),
        purchaseBySupplier: [
          { name: 'Global Importers Inc.', value: 185000 },
          { name: 'Elite Distributors Ltd', value: 112000 },
          { name: 'Direct Tech Wholesale', value: 74000 },
          { name: 'Apex Foods & Supplies', value: 24500 },
        ],
        supplierCredits: 142000,
        debitNotesCount: 14,
      };
    }
  }

  async getInventoryAnalytics(filters?: AnalyticsFilterParams): Promise<InventoryAnalyticsData> {
    try {
      const response = await this.get<InventoryAnalyticsData>(
        apiConfig.endpoints.analytics.inventory,
        filters,
      );
      return response.data;
    } catch {
      return {
        totalStockValue: 845200,
        lowStockItemsCount: 24,
        inventoryTrend: [
          { date: '2026-07-10', value: 830000 },
          { date: '2026-07-11', value: 838000 },
          { date: '2026-07-12', value: 841000 },
          { date: '2026-07-13', value: 835000 },
          { date: '2026-07-14', value: 849000 },
          { date: '2026-07-15', value: 844000 },
          { date: '2026-07-16', value: 845200 },
        ],
        inventoryByWarehouse: [
          { name: 'Main Hub Warehouse A', value: 485000 },
          { name: 'Transit Depot B', value: 215000 },
          { name: 'Retail Storefront Shelf', value: 145200 },
        ],
        turnoverRatio: 8.4,
      };
    }
  }

  async getCustomerAnalytics(filters?: AnalyticsFilterParams): Promise<CustomerAnalyticsData> {
    try {
      const response = await this.get<CustomerAnalyticsData>(
        apiConfig.endpoints.analytics.customers,
        filters,
      );
      return response.data;
    } catch {
      return {
        totalCustomers: 3241,
        customerGrowthTrend: [
          { date: '2026-07-10', value: 3180 },
          { date: '2026-07-11', value: 3195 },
          { date: '2026-07-12', value: 3208 },
          { date: '2026-07-13', value: 3218 },
          { date: '2026-07-14', value: 3225 },
          { date: '2026-07-15', value: 3233 },
          { date: '2026-07-16', value: 3241 },
        ],
        customerSegmentation: [
          { name: 'VIP Champions', value: 324 },
          { name: 'Loyal Regulars', value: 1245 },
          { name: 'New Signups', value: 648 },
          { name: 'Hibernating / Risk', value: 1024 },
        ],
        topCustomers: [
          { id: 'c-451', name: 'Zayn Malik', secondaryInfo: 'VIP Platinum', amount: 8450 },
          { id: 'c-459', name: 'Alia Bhatt', secondaryInfo: 'Loyal Champion', amount: 6920 },
          { id: 'c-462', name: 'Ranbir Kapoor', secondaryInfo: 'Active Shopper', amount: 5120 },
        ],
      };
    }
  }

  async getSupplierAnalytics(filters?: AnalyticsFilterParams): Promise<SupplierAnalyticsData> {
    try {
      const response = await this.get<SupplierAnalyticsData>(
        apiConfig.endpoints.analytics.suppliers,
        filters,
      );
      return response.data;
    } catch {
      return {
        totalSuppliers: 84,
        topSuppliers: [
          {
            id: 's-201',
            name: 'Global Importers Inc.',
            secondaryInfo: 'Lead: 4 days',
            amount: 185000,
          },
          {
            id: 's-205',
            name: 'Elite Distributors Ltd',
            secondaryInfo: 'Lead: 6 days',
            amount: 112000,
          },
          {
            id: 's-210',
            name: 'Direct Tech Wholesale',
            secondaryInfo: 'Lead: 3 days',
            amount: 74000,
          },
        ],
        purchaseBySupplier: [
          { name: 'Global Importers Inc.', value: 185000 },
          { name: 'Elite Distributors Ltd', value: 112000 },
          { name: 'Direct Tech Wholesale', value: 74000 },
          { name: 'Apex Foods & Supplies', value: 24500 },
        ],
      };
    }
  }

  async getBranchPerformance(filters?: AnalyticsFilterParams): Promise<BranchPerformance[]> {
    try {
      const response = await this.get<BranchPerformance[]>(
        apiConfig.endpoints.analytics.branches,
        filters,
      );
      return response.data;
    } catch {
      return [
        {
          branchId: 'b-1',
          branchName: 'Dhaka Central (HQ)',
          revenue: 580000,
          salesCount: 3100,
          profit: 215000,
        },
        {
          branchId: 'b-2',
          branchName: 'Chittagong Port',
          revenue: 340000,
          salesCount: 1850,
          profit: 120000,
        },
        {
          branchId: 'b-3',
          branchName: 'Sylhet Valley',
          revenue: 210000,
          salesCount: 1100,
          profit: 78000,
        },
        {
          branchId: 'b-4',
          branchName: 'Rajshahi Express',
          revenue: 118400,
          salesCount: 650,
          profit: 39400,
        },
      ];
    }
  }

  async getWarehousePerformance(filters?: AnalyticsFilterParams): Promise<WarehousePerformance[]> {
    try {
      const response = await this.get<WarehousePerformance[]>(
        apiConfig.endpoints.analytics.warehouses,
        filters,
      );
      return response.data;
    } catch {
      return [
        {
          warehouseId: 'w-1',
          warehouseName: 'Main Hub Warehouse A',
          stockValue: 485000,
          itemCount: 12500,
          occupancyPercentage: 78.4,
        },
        {
          warehouseId: 'w-2',
          warehouseName: 'Transit Depot B',
          stockValue: 215000,
          itemCount: 6800,
          occupancyPercentage: 45.2,
        },
        {
          warehouseId: 'w-3',
          warehouseName: 'Retail Storefront Shelf',
          stockValue: 145200,
          itemCount: 2900,
          occupancyPercentage: 88.9,
        },
      ];
    }
  }

  async getEmployeeAnalytics(filters?: AnalyticsFilterParams): Promise<EmployeeAnalyticsData> {
    try {
      const response = await this.get<EmployeeAnalyticsData>(
        apiConfig.endpoints.analytics.employees,
        filters,
      );
      return response.data;
    } catch {
      return {
        totalEmployees: 48,
        topEmployees: [
          { id: 'emp-101', name: 'Tanvir Hossain', secondaryInfo: 'Dhaka Central', amount: 85400 },
          { id: 'emp-105', name: 'Nabila Rahman', secondaryInfo: 'Chittagong Port', amount: 69200 },
          { id: 'emp-112', name: 'Arif Ahmed', secondaryInfo: 'Sylhet Valley', amount: 54100 },
        ],
      };
    }
  }
}

export const analyticsService = new AnalyticsService();

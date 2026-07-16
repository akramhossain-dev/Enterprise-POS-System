'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService, type AnalyticsFilterParams } from '@/services/analytics.service';

export const EXECUTIVE_STATS_KEY = ['executive-dashboard-stats'] as const;
export const SALES_ANALYTICS_KEY = ['sales-analytics-stats'] as const;
export const PURCHASE_ANALYTICS_KEY = ['purchase-analytics-stats'] as const;
export const INVENTORY_ANALYTICS_KEY = ['inventory-analytics-stats'] as const;
export const CUSTOMER_ANALYTICS_KEY = ['customer-analytics-stats'] as const;
export const SUPPLIER_ANALYTICS_KEY = ['supplier-analytics-stats'] as const;
export const BRANCH_ANALYTICS_KEY = ['branch-analytics-stats'] as const;
export const WAREHOUSE_ANALYTICS_KEY = ['warehouse-analytics-stats'] as const;
export const EMPLOYEE_ANALYTICS_KEY = ['employee-analytics-stats'] as const;

export function useExecutiveDashboardStats(params?: AnalyticsFilterParams) {
  return useQuery({
    queryKey: [...EXECUTIVE_STATS_KEY, params],
    queryFn: () => analyticsService.getExecutiveKpis(params),
  });
}

export function useSalesAnalyticsStats(params?: AnalyticsFilterParams) {
  return useQuery({
    queryKey: [...SALES_ANALYTICS_KEY, params],
    queryFn: () => analyticsService.getSalesAnalytics(params),
  });
}

export function usePurchaseAnalyticsStats(params?: AnalyticsFilterParams) {
  return useQuery({
    queryKey: [...PURCHASE_ANALYTICS_KEY, params],
    queryFn: () => analyticsService.getPurchaseAnalytics(params),
  });
}

export function useInventoryAnalyticsStats(params?: AnalyticsFilterParams) {
  return useQuery({
    queryKey: [...INVENTORY_ANALYTICS_KEY, params],
    queryFn: () => analyticsService.getInventoryAnalytics(params),
  });
}

export function useCustomerAnalyticsStats(params?: AnalyticsFilterParams) {
  return useQuery({
    queryKey: [...CUSTOMER_ANALYTICS_KEY, params],
    queryFn: () => analyticsService.getCustomerAnalytics(params),
  });
}

export function useSupplierAnalyticsStats(params?: AnalyticsFilterParams) {
  return useQuery({
    queryKey: [...SUPPLIER_ANALYTICS_KEY, params],
    queryFn: () => analyticsService.getSupplierAnalytics(params),
  });
}

export function useBranchAnalyticsStats(params?: AnalyticsFilterParams) {
  return useQuery({
    queryKey: [...BRANCH_ANALYTICS_KEY, params],
    queryFn: () => analyticsService.getBranchPerformance(params),
  });
}

export function useWarehouseAnalyticsStats(params?: AnalyticsFilterParams) {
  return useQuery({
    queryKey: [...WAREHOUSE_ANALYTICS_KEY, params],
    queryFn: () => analyticsService.getWarehousePerformance(params),
  });
}

export function useEmployeeAnalyticsStats(params?: AnalyticsFilterParams) {
  return useQuery({
    queryKey: [...EMPLOYEE_ANALYTICS_KEY, params],
    queryFn: () => analyticsService.getEmployeeAnalytics(params),
  });
}

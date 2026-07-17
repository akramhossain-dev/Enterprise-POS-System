import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  Inventory,
  InventoryFilterParams,
  StockAlert,
  InventoryLedger,
  StockHistoryFilterParams,
} from '@/types/inventory';

export interface InventorySummary {
  totalProducts: number;
  totalStockValue: string;
  lowStockCount: number;
  outOfStockCount: number;
  warehouseWiseStock: Array<{
    warehouseId: string;
    warehouseName: string;
    totalStock: string;
  }>;
}

class InventoryService extends ApiClient {
  // ---- Inventory Record CRUD ----
  async getInventories(params?: InventoryFilterParams): Promise<PaginatedResponse<Inventory>> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.warehouseId) queryParams['warehouseId'] = params.warehouseId;
    if (params?.categoryId) queryParams['categoryId'] = params.categoryId;

    // Map stockStatus filter
    if (params?.stockStatus === 'LOW_STOCK') {
      queryParams['lowStock'] = true;
    } else if (params?.stockStatus === 'OUT_OF_STOCK') {
      queryParams['outOfStock'] = true;
    }

    if (params?.sortBy) queryParams['sortBy'] = params.sortBy;
    if (params?.sortOrder) queryParams['sortOrder'] = params.sortOrder;

    const response = await this.get<Inventory[]>(apiConfig.endpoints.inventory, queryParams);

    return {
      data: response.data ?? [],
      meta: response.meta || {
        page: params?.page ?? 1,
        pageSize: params?.limit ?? 20,
        total: (response.data ?? []).length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  async getInventory(id: string): Promise<Inventory> {
    const response = await this.get<Inventory>(`${apiConfig.endpoints.inventory}/${id}`);
    return response.data;
  }

  async getInventoryByProduct(productId: string): Promise<Inventory[]> {
    const response = await this.get<Inventory[]>(
      `${apiConfig.endpoints.inventory}/product/${productId}`,
    );
    return response.data;
  }

  async getInventoryByWarehouse(warehouseId: string): Promise<Inventory[]> {
    const response = await this.get<Inventory[]>(
      `${apiConfig.endpoints.inventory}/warehouse/${warehouseId}`,
    );
    return response.data;
  }

  async addOpeningStock(payload: {
    companyId: string;
    warehouseId: string;
    productId: string;
    quantity: number;
    averageCost: number;
    minimumQuantity: number;
    reorderQuantity: number;
    maximumQuantity?: number;
  }): Promise<Inventory> {
    const response = await this.post<Inventory>(
      `${apiConfig.endpoints.inventory}/opening-stock`,
      payload,
    );
    return response.data;
  }

  async updateMinStock(payload: {
    inventoryId: string;
    minimumQuantity: number;
    reorderQuantity?: number;
  }): Promise<Inventory> {
    const response = await this.patch<Inventory>(
      `${apiConfig.endpoints.inventory}/min-stock`,
      payload,
    );
    return response.data;
  }

  async updateReorderLevel(payload: {
    inventoryId: string;
    reorderQuantity: number;
  }): Promise<Inventory> {
    const response = await this.patch<Inventory>(
      `${apiConfig.endpoints.inventory}/reorder-level`,
      payload,
    );
    return response.data;
  }

  // ---- Dashboard Analytics Integration ----
  async getInventorySummary(): Promise<InventorySummary> {
    const response = await this.get<InventorySummary>('/dashboard/inventory-summary');
    return response.data;
  }

  // ---- Stock Alerts Integration ----
  async getStockAlerts(params?: {
    page?: number;
    limit?: number;
    warehouseId?: string;
    alertType?: string;
    status?: string;
  }): Promise<PaginatedResponse<StockAlert>> {
    const response = await this.get<StockAlert[]>(apiConfig.endpoints.stockAlerts, params);

    return {
      data: response.data ?? [],
      meta: response.meta || {
        page: params?.page ?? 1,
        pageSize: params?.limit ?? 20,
        total: (response.data ?? []).length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  async triggerAlertScan(
    companyId: string,
    warehouseId?: string,
  ): Promise<{ created: number; resolved: number }> {
    const response = await this.post<{ created: number; resolved: number }>(
      `${apiConfig.endpoints.stockAlerts}/scan`,
      { companyId, warehouseId },
    );
    return response.data;
  }

  async getReorderSuggestions(companyId: string, warehouseId?: string): Promise<any[]> {
    const response = await this.get<any[]>(
      `${apiConfig.endpoints.stockAlerts}/reorder-suggestions`,
      { companyId, warehouseId },
    );
    return response.data;
  }

  async resolveStockAlert(id: string): Promise<StockAlert> {
    const response = await this.patch<StockAlert>(
      `${apiConfig.endpoints.stockAlerts}/${id}/resolve`,
      {},
    );
    return response.data;
  }

  // ---- Stock History (Inventory Ledger) Integration ----
  async getLedgerEntries(
    params?: StockHistoryFilterParams,
  ): Promise<PaginatedResponse<InventoryLedger>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.warehouseId) queryParams['warehouseId'] = params.warehouseId;
    if (params?.movementType && params.movementType !== 'ALL') {
      queryParams['movementType'] = params.movementType;
    }
    if (params?.startDate) queryParams['startDate'] = params.startDate;
    if (params?.endDate) queryParams['endDate'] = params.endDate;

    const response = await this.get<InventoryLedger[]>(
      apiConfig.endpoints.inventoryLedger,
      queryParams,
    );

    return {
      data: response.data ?? [],
      meta: response.meta || {
        page: params?.page ?? 1,
        pageSize: params?.limit ?? 20,
        total: (response.data ?? []).length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  async getLedgerEntry(id: string): Promise<InventoryLedger> {
    const response = await this.get<InventoryLedger>(
      `${apiConfig.endpoints.inventoryLedger}/${id}`,
    );
    return response.data;
  }
}

export const inventoryService = new InventoryService();

import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type {
  StockTake,
  StockTakeFilterParams,
  Reconciliation,
  ReconciliationFilterParams,
} from '@/types/inventory';

class StockTakeService extends ApiClient {
  // ---- Stock Take Operations ----
  async getStockTakes(params?: StockTakeFilterParams): Promise<PaginatedResponse<StockTake>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.warehouseId) queryParams['warehouseId'] = params.warehouseId;
    if (params?.status && params.status !== 'ALL') {
      queryParams['status'] = params.status;
    }

    const response = await this.get<{
      stockTakes: StockTake[];
      meta: PaginatedResponse<StockTake>['meta'];
    }>(apiConfig.endpoints.stockTakes, queryParams);

    return {
      data: response.data.stockTakes ?? [],
      meta: response.meta ||
        response.data.meta || {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 20,
          total: (response.data.stockTakes ?? []).length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }

  async getStockTake(id: string): Promise<StockTake> {
    const response = await this.get<StockTake>(`${apiConfig.endpoints.stockTakes}/${id}`);
    return response.data;
  }

  async createStockTake(payload: {
    companyId: string;
    warehouseId: string;
    title: string;
    conductedBy?: string;
  }): Promise<StockTake> {
    const response = await this.post<StockTake>(apiConfig.endpoints.stockTakes, payload);
    return response.data;
  }

  async populateStockTake(id: string): Promise<{ count: number }> {
    const response = await this.post<{ count: number }>(
      `${apiConfig.endpoints.stockTakes}/${id}/populate`,
      {},
    );
    return response.data;
  }

  async addOrUpdateItem(
    id: string,
    payload: { productId: string; physicalQuantity: number; remarks?: string },
  ): Promise<any> {
    const response = await this.post<any>(`${apiConfig.endpoints.stockTakes}/${id}/items`, payload);
    return response.data;
  }

  async bulkAddItems(
    id: string,
    payload: { items: Array<{ productId: string; physicalQuantity: number; remarks?: string }> },
  ): Promise<{ count: number }> {
    const response = await this.post<{ count: number }>(
      `${apiConfig.endpoints.stockTakes}/${id}/items/bulk`,
      payload,
    );
    return response.data;
  }

  async startStockTake(id: string): Promise<StockTake> {
    const response = await this.patch<StockTake>(
      `${apiConfig.endpoints.stockTakes}/${id}/start`,
      {},
    );
    return response.data;
  }

  async completeStockTake(id: string): Promise<StockTake> {
    const response = await this.patch<StockTake>(
      `${apiConfig.endpoints.stockTakes}/${id}/complete`,
      {},
    );
    return response.data;
  }

  async cancelStockTake(id: string): Promise<StockTake> {
    const response = await this.patch<StockTake>(
      `${apiConfig.endpoints.stockTakes}/${id}/cancel`,
      {},
    );
    return response.data;
  }

  // ---- Reconciliation Operations ----
  async getReconciliations(
    params?: ReconciliationFilterParams,
  ): Promise<PaginatedResponse<Reconciliation>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.status && params.status !== 'ALL') {
      queryParams['status'] = params.status;
    }

    const response = await this.get<{
      reconciliations: Reconciliation[];
      meta: PaginatedResponse<Reconciliation>['meta'];
    }>(apiConfig.endpoints.reconciliation, queryParams);

    return {
      data: response.data.reconciliations ?? [],
      meta: response.meta ||
        response.data.meta || {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 20,
          total: (response.data.reconciliations ?? []).length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }

  async getReconciliation(id: string): Promise<Reconciliation> {
    const response = await this.get<Reconciliation>(`${apiConfig.endpoints.reconciliation}/${id}`);
    return response.data;
  }

  async createReconciliation(payload: {
    companyId: string;
    stockTakeId: string;
    notes?: string;
  }): Promise<Reconciliation> {
    const response = await this.post<Reconciliation>(apiConfig.endpoints.reconciliation, payload);
    return response.data;
  }

  async approveReconciliation(id: string, payload?: { notes?: string }): Promise<Reconciliation> {
    const response = await this.patch<Reconciliation>(
      `${apiConfig.endpoints.reconciliation}/${id}/approve`,
      payload ?? {},
    );
    return response.data;
  }

  async rejectReconciliation(id: string, payload?: { notes?: string }): Promise<Reconciliation> {
    const response = await this.patch<Reconciliation>(
      `${apiConfig.endpoints.reconciliation}/${id}/reject`,
      payload ?? {},
    );
    return response.data;
  }
}

export const stockTakeService = new StockTakeService();

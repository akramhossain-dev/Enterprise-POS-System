import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { StockAdjustment, StockAdjustmentFilterParams } from '@/types/inventory';

class AdjustmentService extends ApiClient {
  async getAdjustments(
    params?: StockAdjustmentFilterParams,
  ): Promise<PaginatedResponse<StockAdjustment>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.warehouseId) queryParams['warehouseId'] = params.warehouseId;
    if (params?.type && params.type !== 'ALL') {
      queryParams['type'] = params.type;
    }

    const response = await this.get<{
      adjustments: StockAdjustment[];
      meta: PaginatedResponse<StockAdjustment>['meta'];
    }>(apiConfig.endpoints.stockAdjustments, queryParams);

    return {
      data: response.data.adjustments ?? [],
      meta: response.meta ||
        response.data.meta || {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 20,
          total: (response.data.adjustments ?? []).length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }

  async getAdjustment(id: string): Promise<StockAdjustment> {
    const response = await this.get<StockAdjustment>(
      `${apiConfig.endpoints.stockAdjustments}/${id}`,
    );
    return response.data;
  }

  async createAdjustment(payload: {
    companyId: string;
    warehouseId: string;
    productId: string;
    type: string;
    quantity: number;
    reason: string;
    remarks?: string;
  }): Promise<StockAdjustment> {
    const response = await this.post<StockAdjustment>(
      apiConfig.endpoints.stockAdjustments,
      payload,
    );
    return response.data;
  }
}

export const adjustmentService = new AdjustmentService();

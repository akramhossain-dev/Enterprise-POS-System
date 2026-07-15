import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { StockTransfer, StockTransferFilterParams } from '@/types/inventory';

class TransferService extends ApiClient {
  async getTransfers(
    params?: StockTransferFilterParams,
  ): Promise<PaginatedResponse<StockTransfer>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.fromWarehouseId) queryParams['fromWarehouseId'] = params.fromWarehouseId;
    if (params?.toWarehouseId) queryParams['toWarehouseId'] = params.toWarehouseId;
    if (params?.status && params.status !== 'ALL') {
      queryParams['status'] = params.status;
    }

    const response = await this.get<{
      transfers: StockTransfer[];
      meta: PaginatedResponse<StockTransfer>['meta'];
    }>(apiConfig.endpoints.stockTransfers, queryParams);

    return {
      data: response.data.transfers ?? [],
      meta: response.meta ||
        response.data.meta || {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 20,
          total: (response.data.transfers ?? []).length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }

  async getTransfer(id: string): Promise<StockTransfer> {
    const response = await this.get<StockTransfer>(`${apiConfig.endpoints.stockTransfers}/${id}`);
    return response.data;
  }

  async createTransfer(payload: {
    companyId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    remarks?: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<StockTransfer> {
    const response = await this.post<StockTransfer>(apiConfig.endpoints.stockTransfers, payload);
    return response.data;
  }

  async approveTransfer(id: string): Promise<StockTransfer> {
    const response = await this.patch<StockTransfer>(
      `${apiConfig.endpoints.stockTransfers}/${id}/approve`,
      {},
    );
    return response.data;
  }

  async rejectTransfer(id: string): Promise<StockTransfer> {
    const response = await this.patch<StockTransfer>(
      `${apiConfig.endpoints.stockTransfers}/${id}/reject`,
      {},
    );
    return response.data;
  }

  async completeTransfer(id: string): Promise<StockTransfer> {
    const response = await this.patch<StockTransfer>(
      `${apiConfig.endpoints.stockTransfers}/${id}/complete`,
      {},
    );
    return response.data;
  }
}

export const transferService = new TransferService();

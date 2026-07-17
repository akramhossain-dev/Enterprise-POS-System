import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { Batch, BatchFilterParams, BatchStatus } from '@/types/inventory';

class BatchService extends ApiClient {
  async getBatches(params?: BatchFilterParams): Promise<PaginatedResponse<Batch>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.warehouseId) queryParams['warehouseId'] = params.warehouseId;
    if (params?.status) queryParams['status'] = params.status;

    // Map expiry status filters client-side or pass to server if it supports it
    if (params?.expiryStatus && params.expiryStatus !== 'ALL') {
      queryParams['expiryStatus'] = params.expiryStatus;
    }

    const response = await this.get<Batch[]>(apiConfig.endpoints.batches, queryParams);

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

  async getBatch(id: string): Promise<Batch> {
    const response = await this.get<Batch>(`${apiConfig.endpoints.batches}/${id}`);
    return response.data;
  }

  async createBatch(payload: {
    companyId: string;
    warehouseId: string;
    productId: string;
    batchNumber: string;
    manufacturingDate?: string;
    expiryDate?: string;
    quantity: number;
    remarks?: string;
  }): Promise<Batch> {
    const response = await this.post<Batch>(apiConfig.endpoints.batches, payload);
    return response.data;
  }

  async updateBatchStatus(
    id: string,
    payload: { status: BatchStatus; remarks?: string },
  ): Promise<Batch> {
    const response = await this.patch<Batch>(
      `${apiConfig.endpoints.batches}/${id}/status`,
      payload,
    );
    return response.data;
  }

  async expireOldBatches(): Promise<{ count: number }> {
    const response = await this.post<{ count: number }>(
      `${apiConfig.endpoints.batches}/expire-old`,
      {},
    );
    return response.data;
  }
}

export const batchService = new BatchService();

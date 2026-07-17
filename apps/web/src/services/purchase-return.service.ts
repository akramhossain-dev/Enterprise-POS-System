import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { PurchaseReturn, PurchaseReturnFilterParams } from '@/types/purchase-return';

class PurchaseReturnService extends ApiClient {
  async getReturns(
    params?: PurchaseReturnFilterParams,
  ): Promise<PaginatedResponse<PurchaseReturn>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.supplierId) queryParams['supplierId'] = params.supplierId;
    if (params?.warehouseId) queryParams['warehouseId'] = params.warehouseId;
    if (params?.status && params.status !== 'ALL') {
      queryParams['status'] = params.status;
    }
    if (params?.reason && params.reason !== 'ALL') {
      queryParams['reason'] = params.reason;
    }

    const response = await this.get<any>(apiConfig.endpoints.purchaseReturns, queryParams);

    // Backend handleListPurchaseReturns wraps it in { returns, meta }
    return {
      data: response.data.returns ?? [],
      meta: response.meta ?? response.data.meta,
    };
  }

  async getReturn(id: string): Promise<PurchaseReturn> {
    const response = await this.get<PurchaseReturn>(`${apiConfig.endpoints.purchaseReturns}/${id}`);
    return response.data;
  }

  async createReturn(payload: any): Promise<PurchaseReturn> {
    const response = await this.post<PurchaseReturn>(apiConfig.endpoints.purchaseReturns, payload);
    return response.data;
  }

  async updateReturn(id: string, payload: any): Promise<PurchaseReturn> {
    const response = await this.patch<PurchaseReturn>(
      `${apiConfig.endpoints.purchaseReturns}/${id}`,
      payload,
    );
    return response.data;
  }

  async submitReturn(id: string): Promise<PurchaseReturn> {
    const response = await this.patch<PurchaseReturn>(
      `${apiConfig.endpoints.purchaseReturns}/${id}/submit`,
      {},
    );
    return response.data;
  }

  async approveReturn(id: string, notes?: string): Promise<PurchaseReturn> {
    const response = await this.patch<PurchaseReturn>(
      `${apiConfig.endpoints.purchaseReturns}/${id}/approve`,
      { notes },
    );
    return response.data;
  }

  async rejectReturn(id: string, notes?: string): Promise<PurchaseReturn> {
    const response = await this.patch<PurchaseReturn>(
      `${apiConfig.endpoints.purchaseReturns}/${id}/reject`,
      { notes },
    );
    return response.data;
  }

  async cancelReturn(id: string): Promise<PurchaseReturn> {
    const response = await this.patch<PurchaseReturn>(
      `${apiConfig.endpoints.purchaseReturns}/${id}/cancel`,
      {},
    );
    return response.data;
  }

  async completeReturn(id: string): Promise<PurchaseReturn> {
    const response = await this.patch<PurchaseReturn>(
      `${apiConfig.endpoints.purchaseReturns}/${id}/complete`,
      {},
    );
    return response.data;
  }
}

export const purchaseReturnService = new PurchaseReturnService();

import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { GoodsReceive, GoodsReceiveFilterParams } from '@/types/goods-receive';

class GoodsReceiveService extends ApiClient {
  async getGRNs(params?: GoodsReceiveFilterParams): Promise<PaginatedResponse<GoodsReceive>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.warehouseId) queryParams['warehouseId'] = params.warehouseId;
    if (params?.supplierId) queryParams['supplierId'] = params.supplierId;
    if (params?.purchaseOrderId) queryParams['purchaseOrderId'] = params.purchaseOrderId;
    if (params?.grnNumber) queryParams['grnNumber'] = params.grnNumber;
    if (params?.search) queryParams['search'] = params.search;
    if (params?.status && params.status !== 'ALL') {
      queryParams['status'] = params.status;
    }
    if (params?.dateFrom) queryParams['dateFrom'] = params.dateFrom;
    if (params?.dateTo) queryParams['dateTo'] = params.dateTo;

    const response = await this.get<{
      data: GoodsReceive[];
      meta: PaginatedResponse<GoodsReceive>['meta'];
    }>(apiConfig.endpoints.goodsReceive, queryParams);

    // Backend returns list structure wrapped in an object or direct list
    const dataList = Array.isArray(response.data)
      ? response.data
      : (response.data as any).data || (response.data as any).receives || [];

    const meta = response.meta ||
      (response.data as any).meta || {
        page: params?.page ?? 1,
        pageSize: params?.limit ?? 20,
        total: dataList.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

    return {
      data: dataList,
      meta,
    };
  }

  async getGRN(id: string): Promise<GoodsReceive> {
    const response = await this.get<GoodsReceive>(`${apiConfig.endpoints.goodsReceive}/${id}`);
    return response.data;
  }

  async createGRN(payload: {
    companyId: string;
    branchId?: string | null;
    warehouseId: string;
    supplierId: string;
    purchaseOrderId?: string | null;
    receiveDate?: string;
    remarks?: string | null;
    discount?: number;
    tax?: number;
    items: Array<{
      productId: string;
      quantity: number; // Ordered PO qty
      receivedQuantity: number; // Quantity physically received
      unitCost: number;
      batchNumber?: string | null;
      expiryDate?: string | null;
      serialRequired?: boolean;
    }>;
  }): Promise<GoodsReceive> {
    const response = await this.post<GoodsReceive>(apiConfig.endpoints.goodsReceive, payload);
    return response.data;
  }

  async completeGRN(id: string): Promise<GoodsReceive> {
    const response = await this.patch<GoodsReceive>(
      `${apiConfig.endpoints.goodsReceive}/${id}/complete`,
      {},
    );
    return response.data;
  }

  async cancelGRN(id: string): Promise<GoodsReceive> {
    const response = await this.patch<GoodsReceive>(
      `${apiConfig.endpoints.goodsReceive}/${id}/cancel`,
      {},
    );
    return response.data;
  }
}

export const goodsReceiveService = new GoodsReceiveService();

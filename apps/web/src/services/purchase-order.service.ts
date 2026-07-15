import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { PurchaseOrder, PurchaseOrderFilterParams } from '@/types/purchase';

class PurchaseOrderService extends ApiClient {
  async getPOs(params?: PurchaseOrderFilterParams): Promise<PaginatedResponse<PurchaseOrder>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.supplierId) queryParams['supplierId'] = params.supplierId;
    if (params?.warehouseId) queryParams['warehouseId'] = params.warehouseId;
    if (params?.branchId) queryParams['branchId'] = params.branchId;
    if (params?.status && params.status !== 'ALL') {
      queryParams['status'] = params.status;
    }

    const response = await this.get<{
      orders: PurchaseOrder[];
      meta: PaginatedResponse<PurchaseOrder>['meta'];
    }>(apiConfig.endpoints.purchaseOrders, queryParams);

    return {
      data: response.data.orders ?? [],
      meta: response.meta ||
        response.data.meta || {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 20,
          total: (response.data.orders ?? []).length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }

  async getPO(id: string): Promise<PurchaseOrder> {
    const response = await this.get<PurchaseOrder>(`${apiConfig.endpoints.purchaseOrders}/${id}`);
    return response.data;
  }

  async createPO(payload: {
    companyId: string;
    branchId?: string | null;
    warehouseId: string;
    supplierId: string;
    purchaseOrderNumber: string;
    orderDate?: string;
    expectedDate?: string | null;
    remarks?: string | null;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      discount?: number;
      tax?: number;
    }>;
    shippingCost?: number;
    discount?: number;
    tax?: number;
  }): Promise<PurchaseOrder> {
    const response = await this.post<PurchaseOrder>(apiConfig.endpoints.purchaseOrders, payload);
    return response.data;
  }

  async updatePO(
    id: string,
    payload: {
      branchId?: string | null;
      warehouseId?: string;
      supplierId?: string;
      expectedDate?: string | null;
      remarks?: string | null;
      items?: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        discount?: number;
        tax?: number;
      }>;
      shippingCost?: number;
      discount?: number;
      tax?: number;
    },
  ): Promise<PurchaseOrder> {
    const response = await this.patch<PurchaseOrder>(
      `${apiConfig.endpoints.purchaseOrders}/${id}`,
      payload,
    );
    return response.data;
  }

  async submitPO(id: string): Promise<PurchaseOrder> {
    const response = await this.patch<PurchaseOrder>(
      `${apiConfig.endpoints.purchaseOrders}/${id}/submit`,
      {},
    );
    return response.data;
  }

  async approvePO(id: string): Promise<PurchaseOrder> {
    const response = await this.patch<PurchaseOrder>(
      `${apiConfig.endpoints.purchaseOrders}/${id}/approve`,
      {},
    );
    return response.data;
  }

  async rejectPO(id: string): Promise<PurchaseOrder> {
    const response = await this.patch<PurchaseOrder>(
      `${apiConfig.endpoints.purchaseOrders}/${id}/reject`,
      {},
    );
    return response.data;
  }

  async cancelPO(id: string): Promise<PurchaseOrder> {
    const response = await this.patch<PurchaseOrder>(
      `${apiConfig.endpoints.purchaseOrders}/${id}/cancel`,
      {},
    );
    return response.data;
  }

  async deletePO(id: string): Promise<void> {
    await this.delete(`${apiConfig.endpoints.purchaseOrders}/${id}`);
  }
}

export const purchaseOrderService = new PurchaseOrderService();

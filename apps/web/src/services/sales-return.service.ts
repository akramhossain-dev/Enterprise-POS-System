import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { POSOrder, SalesReturn, SalesRefund } from '@/types/sales-return';

class SalesReturnService extends ApiClient {
  // Order Queries
  async getOrders(params?: {
    q?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<POSOrder>> {
    const response = await this.get<any>(apiConfig.endpoints.pos.orders, params);

    // Check if data is already array (due directly) or nested under .orders
    const orders = response.data.orders || (Array.isArray(response.data) ? response.data : []);

    return {
      data: orders,
      meta: response.meta ||
        response.data.meta || {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 10,
          total: orders.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }

  async getOrder(id: string): Promise<POSOrder> {
    const response = await this.get<POSOrder>(`${apiConfig.endpoints.pos.orders}/${id}`);
    return response.data;
  }

  async voidOrder(id: string, reason: string): Promise<POSOrder> {
    const response = await this.post<POSOrder>(`${apiConfig.endpoints.pos.orders}/${id}/void`, {
      reason,
    });
    return response.data;
  }

  // Returns Queries
  async getReturns(params?: {
    q?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SalesReturn>> {
    const response = await this.get<any>(apiConfig.endpoints.pos.returns, params);
    const returns = response.data.returns || (Array.isArray(response.data) ? response.data : []);

    return {
      data: returns,
      meta: response.meta ||
        response.data.meta || {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 10,
          total: returns.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }

  async getReturn(id: string): Promise<SalesReturn> {
    const response = await this.get<SalesReturn>(`${apiConfig.endpoints.pos.returns}/${id}`);
    return response.data;
  }

  async createReturn(payload: any): Promise<SalesReturn> {
    const response = await this.post<SalesReturn>(apiConfig.endpoints.pos.returns, payload);
    return response.data;
  }

  async approveReturn(id: string): Promise<SalesReturn> {
    const response = await this.post<SalesReturn>(
      `${apiConfig.endpoints.pos.returns}/${id}/approve`,
      {},
    );
    return response.data;
  }

  // Refunds Queries
  async getRefunds(params?: {
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SalesRefund>> {
    const response = await this.get<any>(apiConfig.endpoints.pos.refunds, params);
    const refunds = response.data.refunds || (Array.isArray(response.data) ? response.data : []);

    return {
      data: refunds,
      meta: response.meta ||
        response.data.meta || {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 10,
          total: refunds.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }
}

export const salesReturnService = new SalesReturnService();

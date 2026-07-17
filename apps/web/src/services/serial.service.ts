import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { SerialNumber, SerialFilterParams, SerialStatus } from '@/types/inventory';

class SerialService extends ApiClient {
  async getSerials(params?: SerialFilterParams): Promise<PaginatedResponse<SerialNumber>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.warehouseId) queryParams['warehouseId'] = params.warehouseId;
    if (params?.status) queryParams['status'] = params.status;

    const response = await this.get<SerialNumber[]>(apiConfig.endpoints.serials, queryParams);

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

  async getSerial(id: string): Promise<SerialNumber> {
    const response = await this.get<SerialNumber>(`${apiConfig.endpoints.serials}/${id}`);
    return response.data;
  }

  async registerSerial(payload: {
    companyId: string;
    warehouseId: string;
    productId: string;
    serialNumber: string;
    remarks?: string;
  }): Promise<SerialNumber> {
    const response = await this.post<SerialNumber>(apiConfig.endpoints.serials, payload);
    return response.data;
  }

  async registerSerialBulk(payload: {
    companyId: string;
    warehouseId: string;
    productId: string;
    serialNumbers: string[];
    remarks?: string;
  }): Promise<{ count: number; serials: SerialNumber[] }> {
    const response = await this.post<{ count: number; serials: SerialNumber[] }>(
      `${apiConfig.endpoints.serials}/bulk`,
      payload,
    );
    return response.data;
  }

  async updateSerialStatus(
    id: string,
    payload: { status: SerialStatus; remarks?: string },
  ): Promise<SerialNumber> {
    const response = await this.patch<SerialNumber>(
      `${apiConfig.endpoints.serials}/${id}/status`,
      payload,
    );
    return response.data;
  }
}

export const serialService = new SerialService();

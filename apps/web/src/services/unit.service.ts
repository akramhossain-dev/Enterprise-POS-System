import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { Unit } from '@/types/product';
import type { PaginatedResponse } from '@/types/api';

class UnitService extends ApiClient {
  async getUnits(params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Unit>> {
    const response = await this.get<Unit[]>(apiConfig.endpoints.units, params);

    return {
      data: response.data ?? [],
      meta: response.meta ?? {
        page: params?.page ?? 1,
        pageSize: params?.limit ?? 20,
        total: (response.data ?? []).length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  async getUnit(id: string): Promise<Unit> {
    const response = await this.get<Unit>(`${apiConfig.endpoints.units}/${id}`);
    return response.data;
  }

  async createUnit(
    payload: Omit<Unit, 'id' | 'createdAt' | 'updatedAt' | '_count'>,
  ): Promise<Unit> {
    const response = await this.post<Unit>(apiConfig.endpoints.units, payload);
    return response.data;
  }

  async updateUnit(id: string, payload: Partial<Unit>): Promise<Unit> {
    const response = await this.patch<Unit>(`${apiConfig.endpoints.units}/${id}`, payload);
    return response.data;
  }

  async deleteUnit(id: string): Promise<void> {
    await this.delete(`${apiConfig.endpoints.units}/${id}`);
  }

  async archiveUnit(id: string): Promise<Unit> {
    return this.updateUnit(id, { status: 'DELETED' });
  }

  async restoreUnit(id: string): Promise<Unit> {
    return this.updateUnit(id, { status: 'ACTIVE' });
  }
}

export const unitService = new UnitService();

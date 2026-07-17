import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { Brand } from '@/types/product';
import type { PaginatedResponse } from '@/types/api';

class BrandService extends ApiClient {
  async getBrands(params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Brand>> {
    const response = await this.get<Brand[]>(apiConfig.endpoints.brands, params);

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

  async getBrand(id: string): Promise<Brand> {
    const response = await this.get<Brand>(`${apiConfig.endpoints.brands}/${id}`);
    return response.data;
  }

  async createBrand(
    payload: Omit<Brand, 'id' | 'createdAt' | 'updatedAt' | '_count'>,
  ): Promise<Brand> {
    const response = await this.post<Brand>(apiConfig.endpoints.brands, payload);
    return response.data;
  }

  async updateBrand(id: string, payload: Partial<Brand>): Promise<Brand> {
    const response = await this.patch<Brand>(`${apiConfig.endpoints.brands}/${id}`, payload);
    return response.data;
  }

  async deleteBrand(id: string): Promise<void> {
    await this.delete(`${apiConfig.endpoints.brands}/${id}`);
  }

  async archiveBrand(id: string): Promise<Brand> {
    return this.updateBrand(id, { status: 'DELETED' });
  }

  async restoreBrand(id: string): Promise<Brand> {
    return this.updateBrand(id, { status: 'ACTIVE' });
  }
}

export const brandService = new BrandService();

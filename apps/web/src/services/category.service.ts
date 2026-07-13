import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { Category } from '@/types/product';
import type { PaginatedResponse } from '@/types/api';

class CategoryService extends ApiClient {
  async getCategories(params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    parentId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Category>> {
    const response = await this.get<{
      categories: Category[];
      meta: PaginatedResponse<Category>['meta'];
    }>(apiConfig.endpoints.categories, params);

    return {
      data: response.data.categories ?? [],
      meta: response.meta ?? {
        page: params?.page ?? 1,
        pageSize: params?.limit ?? 20,
        total: (response.data.categories ?? []).length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  async getCategory(id: string): Promise<Category> {
    const response = await this.get<Category>(`${apiConfig.endpoints.categories}/${id}`);
    return response.data;
  }

  async createCategory(
    payload: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | '_count'>,
  ): Promise<Category> {
    const response = await this.post<Category>(apiConfig.endpoints.categories, payload);
    return response.data;
  }

  async updateCategory(id: string, payload: Partial<Category>): Promise<Category> {
    const response = await this.patch<Category>(`${apiConfig.endpoints.categories}/${id}`, payload);
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.delete(`${apiConfig.endpoints.categories}/${id}`);
  }

  async archiveCategory(id: string): Promise<Category> {
    return this.updateCategory(id, { status: 'DELETED' });
  }

  async restoreCategory(id: string): Promise<Category> {
    return this.updateCategory(id, { status: 'ACTIVE' });
  }
}

export const categoryService = new CategoryService();

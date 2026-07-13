import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Product, ProductFilterParams, Category, Brand, Unit, Tax } from '@/types/product';

class ProductService extends ApiClient {
  async getProducts(params?: ProductFilterParams): Promise<PaginatedResponse<Product>> {
    // If no status is specified, we filter for ACTIVE & INACTIVE only.
    // DISCONTINUED products are considered archived in our client.
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.categoryId) queryParams['categoryId'] = params.categoryId;
    if (params?.brandId) queryParams['brandId'] = params.brandId;
    if (params?.status) queryParams['status'] = params.status;
    if (params?.sortBy) queryParams['sortBy'] = params.sortBy;
    if (params?.sortOrder) queryParams['sortOrder'] = params.sortOrder;

    const response = await this.get<{
      products: Product[];
      meta: PaginatedResponse<Product>['meta'];
    }>(apiConfig.endpoints.products, { params: queryParams });

    return {
      data: response.data.products,
      meta: response.meta ||
        response.data.meta || {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 20,
          total: response.data.products.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }

  async searchProducts(q: string): Promise<Product[]> {
    const response = await this.get<{ products: Product[] }>(
      `${apiConfig.endpoints.products}/search`,
      { params: { q } },
    );
    return response.data.products;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.get<Product>(`${apiConfig.endpoints.products}/${id}`);
    return response.data;
  }

  async createProduct(
    payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'companyId'> & { companyId: string },
  ): Promise<Product> {
    const response = await this.post<Product>(apiConfig.endpoints.products, payload);
    return response.data;
  }

  async updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
    const response = await this.patch<Product>(`${apiConfig.endpoints.products}/${id}`, payload);
    return response.data;
  }

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return this.delete<null>(`${apiConfig.endpoints.products}/${id}`);
  }

  // Soft-deleted/Discontinued operations mapped via status attribute
  async archiveProduct(id: string): Promise<Product> {
    return this.updateProduct(id, { status: 'DISCONTINUED' });
  }

  async restoreProduct(id: string): Promise<Product> {
    return this.updateProduct(id, { status: 'ACTIVE' });
  }

  // Meta lookup methods for forms
  async getCategories(): Promise<Category[]> {
    const response = await this.get<{ categories: Category[] }>(apiConfig.endpoints.categories);
    return response.data.categories ?? [];
  }

  async getBrands(): Promise<Brand[]> {
    const response = await this.get<{ brands: Brand[] }>(apiConfig.endpoints.brands);
    return response.data.brands ?? [];
  }

  async getUnits(): Promise<Unit[]> {
    const response = await this.get<{ units: Unit[] }>(apiConfig.endpoints.units);
    return response.data.units ?? [];
  }

  async getTaxes(): Promise<Tax[]> {
    const response = await this.get<{ taxes: Tax[] }>('/taxes');
    return response.data.taxes ?? [];
  }

  // Barcode Generation UI helper (mock utility that generates svg string)
  generateBarcodeSvg(barcode: string): string {
    // Return standard barcode placeholder SVG
    return `<svg class="w-full h-16" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="40" fill="#fff"/>
      <!-- barcode lines -->
      <line x1="10" y1="5" x2="10" y2="35" stroke="#000" stroke-width="2"/>
      <line x1="14" y1="5" x2="14" y2="35" stroke="#000" stroke-width="1"/>
      <line x1="18" y1="5" x2="18" y2="35" stroke="#000" stroke-width="3"/>
      <line x1="24" y1="5" x2="24" y2="35" stroke="#000" stroke-width="1"/>
      <line x1="28" y1="5" x2="28" y2="35" stroke="#000" stroke-width="2"/>
      <line x1="34" y1="5" x2="34" y2="35" stroke="#000" stroke-width="4"/>
      <line x1="40" y1="5" x2="40" y2="35" stroke="#000" stroke-width="1"/>
      <line x1="44" y1="5" x2="44" y2="35" stroke="#000" stroke-width="2"/>
      <line x1="50" y1="5" x2="50" y2="35" stroke="#000" stroke-width="3"/>
      <line x1="56" y1="5" x2="56" y2="35" stroke="#000" stroke-width="1"/>
      <line x1="60" y1="5" x2="60" y2="35" stroke="#000" stroke-width="2"/>
      <line x1="66" y1="5" x2="66" y2="35" stroke="#000" stroke-width="4"/>
      <line x1="72" y1="5" x2="72" y2="35" stroke="#000" stroke-width="1"/>
      <line x1="76" y1="5" x2="76" y2="35" stroke="#000" stroke-width="2"/>
      <line x1="82" y1="5" x2="82" y2="35" stroke="#000" stroke-width="3"/>
      <line x1="88" y1="5" x2="88" y2="35" stroke="#000" stroke-width="1"/>
      <text x="50" y="39" font-size="4" font-family="monospace" text-anchor="middle" fill="#000">${barcode}</text>
    </svg>`;
  }
}

export const productService = new ProductService();

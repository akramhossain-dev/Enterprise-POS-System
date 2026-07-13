import axiosInstance from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';
import type { AxiosRequestConfig } from 'axios';

/**
 * Base typed API client.
 * All service classes extend or use this.
 */
export class ApiClient {
  protected readonly http = axiosInstance;

  protected async get<T>(
    url: string,
    params?: PaginationParams | Record<string, unknown>,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.http.get<ApiResponse<T>>(url, {
      params,
      ...config,
    });
    return response.data;
  }

  protected async getPaginated<T>(
    url: string,
    params?: PaginationParams,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const response = await this.http.get<ApiResponse<PaginatedResponse<T>>>(url, {
      params,
      ...config,
    });
    return response.data;
  }

  protected async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.http.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  protected async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.http.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  protected async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.http.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  protected async delete<T = void>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.http.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { SupplierInvoice, SupplierInvoiceFilterParams } from '@/types/goods-receive';

class SupplierInvoiceService extends ApiClient {
  async getInvoices(
    params?: SupplierInvoiceFilterParams,
  ): Promise<PaginatedResponse<SupplierInvoice>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.supplierId) queryParams['supplierId'] = params.supplierId;
    if (params?.status && params.status !== 'ALL') {
      queryParams['status'] = params.status;
    }
    if (params?.invoiceNumber) queryParams['invoiceNumber'] = params.invoiceNumber;

    const response = await this.get<{
      data: SupplierInvoice[];
      meta: PaginatedResponse<SupplierInvoice>['meta'];
    }>(apiConfig.endpoints.supplierInvoices, queryParams);

    const dataList = Array.isArray(response.data)
      ? response.data
      : (response.data as any).data || (response.data as any).invoices || [];

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

  async getInvoice(id: string): Promise<SupplierInvoice> {
    const response = await this.get<SupplierInvoice>(
      `${apiConfig.endpoints.supplierInvoices}/${id}`,
    );
    return response.data;
  }

  async createInvoice(payload: {
    goodsReceiveId: string;
    invoiceNumber: string;
    invoiceDate: string;
    tax?: number;
    discount?: number;
    subtotal?: number;
    grandTotal?: number;
  }): Promise<SupplierInvoice> {
    const response = await this.post<SupplierInvoice>(
      apiConfig.endpoints.supplierInvoices,
      payload,
    );
    return response.data;
  }
}

export const supplierInvoiceService = new SupplierInvoiceService();

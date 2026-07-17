import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { SupplierDebitNote, SupplierDebitNoteFilterParams } from '@/types/purchase-return';

class SupplierDebitNoteService extends ApiClient {
  async getDebitNotes(
    params?: SupplierDebitNoteFilterParams,
  ): Promise<PaginatedResponse<SupplierDebitNote>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.supplierId) queryParams['supplierId'] = params.supplierId;
    if (params?.status && params.status !== 'ALL') {
      queryParams['status'] = params.status;
    }

    const response = await this.get<any>(apiConfig.endpoints.supplierDebitNotes, queryParams);

    // Backend handleListSupplierDebitNotes wraps it in { debitNotes, meta }
    return {
      data: response.data.debitNotes ?? [],
      meta: response.meta ?? response.data.meta,
    };
  }

  async createDebitNote(payload: any): Promise<SupplierDebitNote> {
    const response = await this.post<SupplierDebitNote>(
      apiConfig.endpoints.supplierDebitNotes,
      payload,
    );
    return response.data;
  }
}

export const supplierDebitNoteService = new SupplierDebitNoteService();

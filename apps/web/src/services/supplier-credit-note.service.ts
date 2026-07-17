import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { SupplierCreditNote, SupplierCreditNoteFilterParams } from '@/types/purchase-return';

class SupplierCreditNoteService extends ApiClient {
  async getCreditNotes(
    params?: SupplierCreditNoteFilterParams,
  ): Promise<PaginatedResponse<SupplierCreditNote>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.supplierId) queryParams['supplierId'] = params.supplierId;
    if (params?.status && params.status !== 'ALL') {
      queryParams['status'] = params.status;
    }

    const response = await this.get<any>(apiConfig.endpoints.supplierCreditNotes, queryParams);

    // Backend handleListSupplierCreditNotes wraps it in { creditNotes, meta }
    return {
      data: response.data.creditNotes ?? [],
      meta: response.meta ?? response.data.meta,
    };
  }

  async createCreditNote(payload: any): Promise<SupplierCreditNote> {
    const response = await this.post<SupplierCreditNote>(
      apiConfig.endpoints.supplierCreditNotes,
      payload,
    );
    return response.data;
  }
}

export const supplierCreditNoteService = new SupplierCreditNoteService();

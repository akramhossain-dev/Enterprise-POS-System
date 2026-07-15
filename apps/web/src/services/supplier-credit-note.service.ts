import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { SupplierCreditNote, SupplierCreditNoteFilterParams } from '@/types/purchase-return';

const STORAGE_KEY = 'epos_simulated_credit_notes';

class SupplierCreditNoteService extends ApiClient {
  private getMockCreditNotes(): SupplierCreditNote[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    // Default mock credit notes
    const defaultNotes: SupplierCreditNote[] = [
      {
        id: 'cn-1',
        creditNoteNumber: 'CN-2026-0001',
        supplierId: 'sup-1',
        supplier: {
          id: 'sup-1',
          companyId: 'comp-1',
          supplierCode: 'SUP001',
          companyName: 'Global Distribute Inc.',
          contactPerson: 'John Doe',
          email: 'john@global.com',
          phone: '123456',
          status: 'ACTIVE',
          alternativePhone: null,
          website: null,
          taxNumber: 'TX123',
          creditLimit: '50000',
          openingBalance: '0',
          currentBalance: '0',
          notes: null,
          addresses: [],
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
        },
        referenceReturnId: 'ret-1',
        referenceReturnNumber: 'PR-2026-07-0001',
        creditAmount: 1270,
        status: 'ISSUED',
        issueDate: '2026-07-11',
        createdAt: '2026-07-11T10:00:00.000Z',
        updatedAt: '2026-07-11T10:00:00.000Z',
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotes));
    return defaultNotes;
  }

  private saveMockCreditNotes(notes: SupplierCreditNote[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }

  async getCreditNotes(
    params?: SupplierCreditNoteFilterParams,
  ): Promise<PaginatedResponse<SupplierCreditNote>> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params?.page) queryParams['page'] = params.page;
      if (params?.limit) queryParams['limit'] = params.limit;
      if (params?.q) queryParams['q'] = params.q;
      if (params?.supplierId) queryParams['supplierId'] = params.supplierId;
      if (params?.status && params.status !== 'ALL') {
        queryParams['status'] = params.status;
      }

      const response = await this.get<{
        creditNotes: SupplierCreditNote[];
        meta: PaginatedResponse<SupplierCreditNote>['meta'];
      }>(apiConfig.endpoints.supplierCreditNotes, queryParams);

      return {
        data: response.data.creditNotes ?? [],
        meta: response.meta || (response.data as any).meta,
      };
    } catch (err) {
      console.warn('CreditNote API error, falling back to simulator:', err);
      let items = this.getMockCreditNotes();

      if (params?.q) {
        const query = params.q.toLowerCase();
        items = items.filter(
          (item) =>
            item.creditNoteNumber.toLowerCase().includes(query) ||
            item.referenceReturnNumber.toLowerCase().includes(query) ||
            (item.supplier && item.supplier.companyName.toLowerCase().includes(query)),
        );
      }

      if (params?.supplierId) {
        items = items.filter((item) => item.supplierId === params.supplierId);
      }

      if (params?.status && params.status !== 'ALL') {
        items = items.filter((item) => item.status === params.status);
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const total = items.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedItems = items.slice(startIndex, startIndex + limit);

      return {
        data: paginatedItems,
        meta: {
          page,
          pageSize: limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }
  }

  async createCreditNote(payload: any): Promise<SupplierCreditNote> {
    try {
      const response = await this.post<SupplierCreditNote>(
        apiConfig.endpoints.supplierCreditNotes,
        payload,
      );
      return response.data;
    } catch (err) {
      console.warn('CreditNote Create API error, falling back to simulator:', err);
      const items = this.getMockCreditNotes();
      const newCN: SupplierCreditNote = {
        id: `cn-${Math.floor(1000 + Math.random() * 9000)}`,
        creditNoteNumber: payload.creditNoteNumber,
        supplierId: payload.supplierId,
        supplier: payload.supplier,
        referenceReturnId: payload.referenceReturnId,
        referenceReturnNumber: payload.referenceReturnNumber,
        creditAmount: payload.creditAmount,
        status: payload.status,
        issueDate: payload.issueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      items.unshift(newCN);
      this.saveMockCreditNotes(items);
      return newCN;
    }
  }
}

export const supplierCreditNoteService = new SupplierCreditNoteService();

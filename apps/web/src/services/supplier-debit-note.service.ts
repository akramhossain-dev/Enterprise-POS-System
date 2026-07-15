import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { SupplierDebitNote, SupplierDebitNoteFilterParams } from '@/types/purchase-return';

const STORAGE_KEY = 'epos_simulated_debit_notes';

class SupplierDebitNoteService extends ApiClient {
  private getMockDebitNotes(): SupplierDebitNote[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    // Default mock debit notes
    const defaultNotes: SupplierDebitNote[] = [
      {
        id: 'dn-1',
        debitNoteNumber: 'DN-2026-0001',
        supplierId: 'sup-2',
        supplier: {
          id: 'sup-2',
          companyId: 'comp-1',
          supplierCode: 'SUP002',
          companyName: 'TechSource Wholesale',
          contactPerson: 'Jane Smith',
          email: 'jane@techsource.com',
          phone: '654321',
          status: 'ACTIVE',
          alternativePhone: null,
          website: null,
          taxNumber: 'TX456',
          creditLimit: '100000',
          openingBalance: '0',
          currentBalance: '0',
          notes: null,
          addresses: [],
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
        },
        referenceReturnId: 'ret-2',
        referenceReturnNumber: 'PR-2026-07-0002',
        amount: 495,
        status: 'ISSUED',
        issueDate: '2026-07-13',
        createdAt: '2026-07-13T10:00:00.000Z',
        updatedAt: '2026-07-13T10:00:00.000Z',
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotes));
    return defaultNotes;
  }

  private saveMockDebitNotes(notes: SupplierDebitNote[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }

  async getDebitNotes(
    params?: SupplierDebitNoteFilterParams,
  ): Promise<PaginatedResponse<SupplierDebitNote>> {
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
        debitNotes: SupplierDebitNote[];
        meta: PaginatedResponse<SupplierDebitNote>['meta'];
      }>(apiConfig.endpoints.supplierDebitNotes, queryParams);

      return {
        data: response.data.debitNotes ?? [],
        meta: response.meta || (response.data as any).meta,
      };
    } catch (err) {
      console.warn('DebitNote API error, falling back to simulator:', err);
      let items = this.getMockDebitNotes();

      if (params?.q) {
        const query = params.q.toLowerCase();
        items = items.filter(
          (item) =>
            item.debitNoteNumber.toLowerCase().includes(query) ||
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

  async createDebitNote(payload: any): Promise<SupplierDebitNote> {
    try {
      const response = await this.post<SupplierDebitNote>(
        apiConfig.endpoints.supplierDebitNotes,
        payload,
      );
      return response.data;
    } catch (err) {
      console.warn('DebitNote Create API error, falling back to simulator:', err);
      const items = this.getMockDebitNotes();
      const newDN: SupplierDebitNote = {
        id: `dn-${Math.floor(1000 + Math.random() * 9000)}`,
        debitNoteNumber: payload.debitNoteNumber,
        supplierId: payload.supplierId,
        supplier: payload.supplier,
        referenceReturnId: payload.referenceReturnId,
        referenceReturnNumber: payload.referenceReturnNumber,
        amount: payload.amount,
        status: payload.status,
        issueDate: payload.issueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      items.unshift(newDN);
      this.saveMockDebitNotes(items);
      return newDN;
    }
  }
}

export const supplierDebitNoteService = new SupplierDebitNoteService();

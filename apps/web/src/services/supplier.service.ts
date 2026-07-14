import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  Supplier,
  SupplierAddress,
  SupplierBalance,
  SupplierLedgerEntry,
  SupplierPayment,
  SupplierFilterParams,
  SupplierLedgerParams,
  SupplierPaymentParams,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  CreateSupplierAddressPayload,
  CreateSupplierPaymentPayload,
} from '@/types/supplier';

class SupplierService extends ApiClient {
  private readonly base = apiConfig.endpoints.suppliers;
  private readonly paymentsBase = apiConfig.endpoints.supplierPayments;

  // ── List ────────────────────────────────────────────────────

  async getSuppliers(params?: SupplierFilterParams): Promise<PaginatedResponse<Supplier>> {
    const q: Record<string, string | number> = {};
    if (params?.page) q['page'] = params.page;
    if (params?.limit) q['limit'] = params.limit;
    if (params?.q) q['q'] = params.q;
    if (params?.status) q['status'] = params.status;
    if (params?.dateFrom) q['dateFrom'] = params.dateFrom;
    if (params?.dateTo) q['dateTo'] = params.dateTo;
    if (params?.sortBy) q['sortBy'] = params.sortBy;
    if (params?.sortOrder) q['sortOrder'] = params.sortOrder;

    const response = await this.get<{
      suppliers: Supplier[];
      meta: PaginatedResponse<Supplier>['meta'];
    }>(this.base, q);

    return {
      data: response.data.suppliers ?? [],
      meta: response.meta ??
        response.data.meta ?? {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 20,
          total: (response.data.suppliers ?? []).length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }

  // ── Single ──────────────────────────────────────────────────

  async getSupplier(id: string): Promise<Supplier> {
    const response = await this.get<Supplier>(`${this.base}/${id}`);
    return response.data;
  }

  // ── Create ──────────────────────────────────────────────────

  async createSupplier(payload: CreateSupplierPayload): Promise<Supplier> {
    const response = await this.post<Supplier>(this.base, payload);
    return response.data;
  }

  // ── Update ──────────────────────────────────────────────────

  async updateSupplier(id: string, payload: UpdateSupplierPayload): Promise<Supplier> {
    const response = await this.patch<Supplier>(`${this.base}/${id}`, payload);
    return response.data;
  }

  // ── Delete (soft) ───────────────────────────────────────────

  async deleteSupplier(id: string): Promise<ApiResponse<null>> {
    return this.delete<null>(`${this.base}/${id}`);
  }

  // ── Archive / Restore ───────────────────────────────────────

  async archiveSupplier(id: string): Promise<Supplier> {
    return this.updateSupplier(id, { status: 'ARCHIVED' });
  }

  async restoreSupplier(id: string): Promise<Supplier> {
    return this.updateSupplier(id, { status: 'ACTIVE' });
  }

  // ── Balance ─────────────────────────────────────────────────

  async getSupplierBalance(id: string): Promise<SupplierBalance> {
    const response = await this.get<SupplierBalance>(`${this.base}/${id}/balance`);
    return response.data;
  }

  // ── Ledger ──────────────────────────────────────────────────

  async getSupplierLedger(
    id: string,
    params?: SupplierLedgerParams,
  ): Promise<PaginatedResponse<SupplierLedgerEntry>> {
    const q: Record<string, string | number> = {};
    if (params?.page) q['page'] = params.page;
    if (params?.limit) q['limit'] = params.limit;
    if (params?.entryType) q['entryType'] = params.entryType;
    if (params?.dateFrom) q['dateFrom'] = params.dateFrom;
    if (params?.dateTo) q['dateTo'] = params.dateTo;

    const response = await this.get<{
      entries: SupplierLedgerEntry[];
      meta: PaginatedResponse<SupplierLedgerEntry>['meta'];
    }>(`${this.base}/${id}/ledger`, q);

    return {
      data: response.data.entries ?? [],
      meta: response.meta ??
        response.data.meta ?? {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 20,
          total: (response.data.entries ?? []).length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }

  // ── Addresses ───────────────────────────────────────────────

  async getSupplierAddresses(id: string): Promise<SupplierAddress[]> {
    const response = await this.get<{ addresses: SupplierAddress[] }>(
      `${this.base}/${id}/addresses`,
    );
    return response.data.addresses ?? [];
  }

  async addSupplierAddress(
    id: string,
    payload: CreateSupplierAddressPayload,
  ): Promise<SupplierAddress> {
    const response = await this.post<SupplierAddress>(`${this.base}/${id}/addresses`, payload);
    return response.data;
  }

  // ── Payments ────────────────────────────────────────────────

  async getSupplierPayments(
    params?: SupplierPaymentParams,
  ): Promise<PaginatedResponse<SupplierPayment>> {
    const q: Record<string, string | number> = {};
    if (params?.page) q['page'] = params.page;
    if (params?.limit) q['limit'] = params.limit;
    if (params?.supplierId) q['supplierId'] = params.supplierId;
    if (params?.paymentMethod) q['paymentMethod'] = params.paymentMethod;
    if (params?.dateFrom) q['dateFrom'] = params.dateFrom;
    if (params?.dateTo) q['dateTo'] = params.dateTo;

    const response = await this.get<{
      payments: SupplierPayment[];
      meta: PaginatedResponse<SupplierPayment>['meta'];
    }>(this.paymentsBase, q);

    return {
      data: response.data.payments ?? [],
      meta: response.meta ??
        response.data.meta ?? {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 20,
          total: (response.data.payments ?? []).length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }

  async createSupplierPayment(payload: CreateSupplierPaymentPayload): Promise<SupplierPayment> {
    const response = await this.post<SupplierPayment>(this.paymentsBase, payload);
    return response.data;
  }
}

export const supplierService = new SupplierService();

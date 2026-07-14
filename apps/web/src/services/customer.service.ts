import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  Customer,
  CustomerAddress,
  CustomerBalance,
  CustomerLedgerEntry,
  CustomerFilterParams,
  CustomerLedgerParams,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CreateCustomerAddressPayload,
} from '@/types/customer';

class CustomerService extends ApiClient {
  private readonly base = apiConfig.endpoints.customers;

  // ── List ────────────────────────────────────────────────────

  async getCustomers(params?: CustomerFilterParams): Promise<PaginatedResponse<Customer>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.q) queryParams['q'] = params.q;
    if (params?.status) queryParams['status'] = params.status;
    if (params?.dateFrom) queryParams['dateFrom'] = params.dateFrom;
    if (params?.dateTo) queryParams['dateTo'] = params.dateTo;
    if (params?.sortBy) queryParams['sortBy'] = params.sortBy;
    if (params?.sortOrder) queryParams['sortOrder'] = params.sortOrder;

    const response = await this.get<{
      customers: Customer[];
      meta: PaginatedResponse<Customer>['meta'];
    }>(this.base, queryParams);

    return {
      data: response.data.customers ?? [],
      meta: response.meta ??
        response.data.meta ?? {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 20,
          total: (response.data.customers ?? []).length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
    };
  }

  // ── Single ──────────────────────────────────────────────────

  async getCustomer(id: string): Promise<Customer> {
    const response = await this.get<Customer>(`${this.base}/${id}`);
    return response.data;
  }

  // ── Create ──────────────────────────────────────────────────

  async createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
    const response = await this.post<Customer>(this.base, payload);
    return response.data;
  }

  // ── Update ──────────────────────────────────────────────────

  async updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<Customer> {
    const response = await this.patch<Customer>(`${this.base}/${id}`, payload);
    return response.data;
  }

  // ── Delete (soft) ───────────────────────────────────────────

  async deleteCustomer(id: string): Promise<ApiResponse<null>> {
    return this.delete<null>(`${this.base}/${id}`);
  }

  // ── Archive / Restore ───────────────────────────────────────

  async archiveCustomer(id: string): Promise<Customer> {
    return this.updateCustomer(id, { status: 'ARCHIVED' });
  }

  async restoreCustomer(id: string): Promise<Customer> {
    return this.updateCustomer(id, { status: 'ACTIVE' });
  }

  // ── Balance ─────────────────────────────────────────────────

  async getCustomerBalance(id: string): Promise<CustomerBalance> {
    const response = await this.get<CustomerBalance>(`${this.base}/${id}/balance`);
    return response.data;
  }

  // ── Ledger ──────────────────────────────────────────────────

  async getCustomerLedger(
    id: string,
    params?: CustomerLedgerParams,
  ): Promise<PaginatedResponse<CustomerLedgerEntry>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.entryType) queryParams['entryType'] = params.entryType;
    if (params?.dateFrom) queryParams['dateFrom'] = params.dateFrom;
    if (params?.dateTo) queryParams['dateTo'] = params.dateTo;

    const response = await this.get<{
      entries: CustomerLedgerEntry[];
      meta: PaginatedResponse<CustomerLedgerEntry>['meta'];
    }>(`${this.base}/${id}/ledger`, queryParams);

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

  async getCustomerAddresses(id: string): Promise<CustomerAddress[]> {
    const response = await this.get<{ addresses: CustomerAddress[] }>(
      `${this.base}/${id}/addresses`,
    );
    return response.data.addresses ?? [];
  }

  async addCustomerAddress(
    id: string,
    payload: CreateCustomerAddressPayload,
  ): Promise<CustomerAddress> {
    const response = await this.post<CustomerAddress>(`${this.base}/${id}/addresses`, payload);
    return response.data;
  }
}

export const customerService = new CustomerService();

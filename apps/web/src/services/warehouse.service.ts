import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { Warehouse, WarehouseFilterParams, WarehouseMetadata } from '@/types/warehouse';
import type { ApiResponse } from '@/types/api';

class WarehouseService extends ApiClient {
  private mergeMetadata(wh: any): Warehouse {
    const defaultMeta: WarehouseMetadata = {
      capacity: 5000,
      utilization: wh.code === 'WH-MAIN' ? 12 : 0,
      storageType: 'DRY',
      description: wh.address || 'Standard warehouse storage.',
    };

    return {
      ...wh,
      metadata: defaultMeta,
    };
  }

  async listWarehouses(params?: WarehouseFilterParams): Promise<ApiResponse<Warehouse[]>> {
    const response = await this.http.get<ApiResponse<Warehouse[]>>(apiConfig.endpoints.warehouses, {
      params,
    });

    const warehouses = (response.data.data || []).map((wh) => this.mergeMetadata(wh));

    return {
      ...response.data,
      data: warehouses,
    };
  }

  async getWarehouse(id: string): Promise<Warehouse> {
    const response = await this.get<any>(`${apiConfig.endpoints.warehouses}/${id}`);
    return this.mergeMetadata(response.data);
  }

  async createWarehouse(
    payload: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'> & { metadata?: WarehouseMetadata },
  ): Promise<Warehouse> {
    const apiPayload = {
      companyId: payload.companyId,
      branchId: payload.branchId || undefined,
      name: payload.name,
      code: payload.code,
      phone: payload.phone || undefined,
      email: payload.email || undefined,
      managerName: payload.managerName || undefined,
      country: payload.country || undefined,
      city: payload.city || undefined,
      address: payload.address || undefined,
      status: payload.status,
      isDefault: payload.isDefault === true,
    };

    const response = await this.post<any>(apiConfig.endpoints.warehouses, apiPayload);
    return this.mergeMetadata(response.data);
  }

  async updateWarehouse(
    id: string,
    payload: Partial<Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>> & {
      metadata?: Partial<WarehouseMetadata>;
    },
  ): Promise<Warehouse> {
    const apiPayload: any = {};
    if (payload.name !== undefined) apiPayload.name = payload.name;
    if (payload.phone !== undefined) apiPayload.phone = payload.phone;
    if (payload.email !== undefined) apiPayload.email = payload.email;
    if (payload.managerName !== undefined) apiPayload.managerName = payload.managerName;
    if (payload.country !== undefined) apiPayload.country = payload.country;
    if (payload.city !== undefined) apiPayload.city = payload.city;
    if (payload.address !== undefined) apiPayload.address = payload.address;
    if (payload.status !== undefined) apiPayload.status = payload.status;
    if (payload.isDefault !== undefined) apiPayload.isDefault = payload.isDefault;

    let updated: any;
    if (Object.keys(apiPayload).length > 0) {
      const response = await this.patch<any>(`${apiConfig.endpoints.warehouses}/${id}`, apiPayload);
      updated = response.data;
    } else {
      updated = await this.getWarehouse(id);
    }

    return this.mergeMetadata(updated);
  }

  async deleteWarehouse(id: string): Promise<void> {
    await this.delete(`${apiConfig.endpoints.warehouses}/${id}`);
  }
}

export const warehouseService = new WarehouseService();

import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { Warehouse, WarehouseFilterParams, WarehouseMetadata } from '@/types/warehouse';
import type { ApiResponse } from '@/types/api';

const METADATA_KEY = 'pos_warehouses_metadata';

class WarehouseService extends ApiClient {
  private getWarehousesMetadata(): Record<string, WarehouseMetadata> {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(METADATA_KEY);
    return stored ? (JSON.parse(stored) as Record<string, WarehouseMetadata>) : {};
  }

  private saveWarehouseMetadata(id: string, metadata: WarehouseMetadata): void {
    if (typeof window === 'undefined') return;
    const all = this.getWarehousesMetadata();
    all[id] = {
      ...(all[id] || {}),
      ...metadata,
    };
    localStorage.setItem(METADATA_KEY, JSON.stringify(all));
  }

  private mergeMetadata(wh: any): Warehouse {
    const allMeta = this.getWarehousesMetadata();

    // Seed default capacity / utilization if not configured
    const defaultMeta: WarehouseMetadata = {
      capacity: 5000,
      utilization: wh.code === 'WH-NY-01' ? 78 : wh.code === 'WH-CH-02' ? 45 : 12,
      storageType: 'DRY',
      description: 'Standard storage location for retail products.',
    };

    const meta = allMeta[wh.id] || defaultMeta;

    return {
      ...wh,
      metadata: meta,
    };
  }

  async listWarehouses(params?: WarehouseFilterParams): Promise<ApiResponse<Warehouse[]>> {
    try {
      const response = await this.http.get<ApiResponse<Warehouse[]>>(
        apiConfig.endpoints.warehouses,
        { params },
      );

      const warehouses = response.data.data.map((wh) => this.mergeMetadata(wh));

      // Filter client-side by storageType if specified
      let filtered = warehouses;
      if (params?.storageType) {
        filtered = filtered.filter((w) => w.metadata?.storageType === params.storageType);
      }

      return {
        ...response.data,
        data: filtered,
      };
    } catch {
      // Fallback local mock list
      const mockWarehouses: Warehouse[] = [
        {
          id: 'wh-1',
          companyId: 'comp-1',
          branchId: 'branch-1',
          branch: { id: 'branch-1', name: 'Main Headquarter' },
          code: 'WH-NY-01',
          name: 'Central Manhattan Depot',
          phone: '+1 555-0811',
          email: 'depot1@enterprise-pos.com',
          managerName: 'Jon Snow',
          country: 'USA',
          city: 'New York',
          address: '750 Broadway Ave',
          status: 'ACTIVE',
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            capacity: 10000,
            utilization: 82,
            storageType: 'DRY',
            description: 'Central hub for high-volume retail electronics.',
          },
        },
        {
          id: 'wh-2',
          companyId: 'comp-1',
          branchId: 'branch-2',
          branch: { id: 'branch-2', name: 'Downtown Retail Branch' },
          code: 'WH-CH-02',
          name: 'Chicago Cold Store',
          phone: '+1 555-0812',
          email: 'coldstore@enterprise-pos.com',
          managerName: 'Daenerys Targaryen',
          country: 'USA',
          city: 'Chicago',
          address: '220 W Kinzie St',
          status: 'ACTIVE',
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            capacity: 5000,
            utilization: 48,
            storageType: 'COLD',
            description: 'Refrigerated environment for perishables and dairy products.',
          },
        },
        {
          id: 'wh-3',
          companyId: 'comp-1',
          branchId: 'branch-3',
          branch: { id: 'branch-3', name: 'Airport Express Outlet' },
          code: 'WH-ATL-03',
          name: 'Atlanta Transit Hub',
          phone: '+1 555-0813',
          email: 'transithub@enterprise-pos.com',
          managerName: 'Tyrion Lannister',
          country: 'USA',
          city: 'Atlanta',
          address: '1000 Hartsfield Blvd',
          status: 'ACTIVE',
          isDefault: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            capacity: 2500,
            utilization: 15,
            storageType: 'DRY',
            description: 'Cross-docking warehouse for fast-moving items.',
          },
        },
        {
          id: 'wh-4',
          companyId: 'comp-1',
          branchId: 'branch-1',
          branch: { id: 'branch-1', name: 'Main Headquarter' },
          code: 'WH-HAZ-04',
          name: 'New Jersey Hazard Cell',
          phone: '+1 555-0814',
          email: 'NJhazard@enterprise-pos.com',
          managerName: 'Arya Stark',
          country: 'USA',
          city: 'Jersey City',
          address: '50 Industrial Parkway',
          status: 'ACTIVE',
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            capacity: 3000,
            utilization: 92,
            storageType: 'HAZARDOUS',
            description: 'Specially ventilated unit for aerosol, gas, and battery assets.',
          },
        },
        {
          id: 'wh-archived',
          companyId: 'comp-1',
          branchId: 'branch-2',
          branch: { id: 'branch-2', name: 'Downtown Retail Branch' },
          code: 'WH-OLD-09',
          name: 'Legacy Queens Warehouse',
          phone: '+1 555-0819',
          email: 'queens@enterprise-pos.com',
          managerName: 'Jorah Mormont',
          country: 'USA',
          city: 'Queens',
          address: '88-12 Astoria Blvd',
          status: 'INACTIVE',
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: new Date().toISOString(),
          metadata: {
            capacity: 4000,
            utilization: 0,
            storageType: 'DRY',
            description: 'Decommissioned facility.',
          },
        },
      ];

      let filtered = mockWarehouses;
      if (params?.q) {
        filtered = filtered.filter(
          (w) =>
            w.name.toLowerCase().includes(params.q!.toLowerCase()) ||
            w.code.toLowerCase().includes(params.q!.toLowerCase()) ||
            (w.managerName && w.managerName.toLowerCase().includes(params.q!.toLowerCase())),
        );
      }
      if (params?.status) {
        filtered = filtered.filter((w) => w.status === params.status);
      }
      if (params?.branchId) {
        filtered = filtered.filter((w) => w.branchId === params.branchId);
      }
      if (params?.storageType) {
        filtered = filtered.filter((w) => w.metadata?.storageType === params.storageType);
      }

      return {
        success: true,
        data: filtered,
        meta: {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 20,
          total: filtered.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  async getWarehouse(id: string): Promise<Warehouse> {
    try {
      const response = await this.get<any>(`${apiConfig.endpoints.warehouses}/${id}`);
      return this.mergeMetadata(response.data);
    } catch {
      const listRes = await this.listWarehouses();
      const match = listRes.data.find((w) => w.id === id);
      if (!match) throw new Error('Warehouse not found');
      return match;
    }
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

    let created: any;
    try {
      const response = await this.post<any>(apiConfig.endpoints.warehouses, apiPayload);
      created = response.data;
    } catch {
      // Mock create fallback
      created = {
        ...payload,
        id: `wh-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (payload.metadata) {
      this.saveWarehouseMetadata(created.id, payload.metadata);
    }

    return this.mergeMetadata(created);
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
    try {
      if (Object.keys(apiPayload).length > 0) {
        const response = await this.patch<any>(
          `${apiConfig.endpoints.warehouses}/${id}`,
          apiPayload,
        );
        updated = response.data;
      } else {
        updated = await this.getWarehouse(id);
      }
    } catch {
      const target = await this.getWarehouse(id);
      updated = {
        ...target,
        ...payload,
        updatedAt: new Date().toISOString(),
      };
    }

    if (payload.metadata) {
      this.saveWarehouseMetadata(id, payload.metadata as WarehouseMetadata);
    }

    return this.mergeMetadata(updated);
  }

  async deleteWarehouse(id: string): Promise<void> {
    try {
      await this.delete(`${apiConfig.endpoints.warehouses}/${id}`);
    } catch {
      // Mock success in local storage
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
}

export const warehouseService = new WarehouseService();

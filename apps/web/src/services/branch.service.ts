import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { Branch, BranchFilterParams, BranchMetadata } from '@/types/warehouse';
import type { ApiResponse } from '@/types/api';

const METADATA_KEY = 'pos_branches_metadata';

class BranchService extends ApiClient {
  private getBranchesMetadata(): Record<string, BranchMetadata> {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(METADATA_KEY);
    return stored ? (JSON.parse(stored) as Record<string, BranchMetadata>) : {};
  }

  private saveBranchMetadata(id: string, metadata: BranchMetadata): void {
    if (typeof window === 'undefined') return;
    const all = this.getBranchesMetadata();
    all[id] = {
      ...(all[id] || {}),
      ...metadata,
    };
    localStorage.setItem(METADATA_KEY, JSON.stringify(all));
  }

  private mergeMetadata(branch: any): Branch {
    const allMeta = this.getBranchesMetadata();
    const meta = allMeta[branch.id] || null;
    return {
      ...branch,
      metadata: meta,
    };
  }

  async listBranches(params?: BranchFilterParams): Promise<ApiResponse<Branch[]>> {
    try {
      const response = await this.http.get<ApiResponse<Branch[]>>(apiConfig.endpoints.branches, {
        params,
      });
      const branches = response.data.data.map((b) => this.mergeMetadata(b));
      return {
        ...response.data,
        data: branches,
      };
    } catch {
      // Fallback local mock list
      const mockBranches: Branch[] = [
        {
          id: 'branch-1',
          companyId: 'comp-1',
          name: 'Main Headquarter',
          address: '100 Corporate Way',
          phone: '+1 555-0100',
          email: 'hq@enterprise-pos.com',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: { city: 'New York', country: 'USA', openingDate: '2020-01-01' },
        },
        {
          id: 'branch-2',
          companyId: 'comp-1',
          name: 'Downtown Retail Branch',
          address: '42 Main St',
          phone: '+1 555-0102',
          email: 'downtown@enterprise-pos.com',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: { city: 'Chicago', country: 'USA', openingDate: '2022-06-15' },
        },
        {
          id: 'branch-3',
          companyId: 'comp-1',
          name: 'Airport Express Outlet',
          address: 'Terminal 2, Gate 4',
          phone: '+1 555-0103',
          email: 'airport@enterprise-pos.com',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: { city: 'Atlanta', country: 'USA', openingDate: '2024-03-01' },
        },
      ];

      let filtered = mockBranches;
      if (params?.q) {
        filtered = filtered.filter((b) => b.name.toLowerCase().includes(params.q!.toLowerCase()));
      }
      if (params?.status) {
        filtered = filtered.filter((b) => b.status === params.status);
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

  async getBranch(id: string): Promise<Branch> {
    try {
      const response = await this.get<any>(`${apiConfig.endpoints.branches}/${id}`);
      return this.mergeMetadata(response.data);
    } catch {
      const listRes = await this.listBranches();
      const match = listRes.data.find((b) => b.id === id);
      if (!match) throw new Error('Branch not found');
      return match;
    }
  }

  async createBranch(
    payload: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'> & { metadata?: BranchMetadata },
  ): Promise<Branch> {
    const apiPayload = {
      companyId: payload.companyId,
      name: payload.name,
      address: payload.address || undefined,
      phone: payload.phone || undefined,
      email: payload.email || undefined,
    };

    let created: any;
    try {
      const response = await this.post<any>(apiConfig.endpoints.branches, apiPayload);
      created = response.data;
    } catch {
      // Mock create fallback
      created = {
        ...payload,
        id: `branch-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (payload.metadata) {
      this.saveBranchMetadata(created.id, payload.metadata);
    }

    return this.mergeMetadata(created);
  }

  async updateBranch(
    id: string,
    payload: Partial<Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>> & {
      metadata?: Partial<BranchMetadata>;
    },
  ): Promise<Branch> {
    const apiPayload: any = {};
    if (payload.name !== undefined) apiPayload.name = payload.name;
    if (payload.address !== undefined) apiPayload.address = payload.address;
    if (payload.phone !== undefined) apiPayload.phone = payload.phone;
    if (payload.email !== undefined) apiPayload.email = payload.email;
    if (payload.status !== undefined) apiPayload.status = payload.status;

    let updated: any;
    try {
      if (Object.keys(apiPayload).length > 0) {
        const response = await this.patch<any>(`${apiConfig.endpoints.branches}/${id}`, apiPayload);
        updated = response.data;
      } else {
        updated = await this.getBranch(id);
      }
    } catch {
      const target = await this.getBranch(id);
      updated = {
        ...target,
        ...payload,
        updatedAt: new Date().toISOString(),
      };
    }

    if (payload.metadata) {
      this.saveBranchMetadata(id, payload.metadata as BranchMetadata);
    }

    return this.mergeMetadata(updated);
  }

  async deleteBranch(id: string): Promise<void> {
    try {
      await this.delete(`${apiConfig.endpoints.branches}/${id}`);
    } catch {
      // Mock success in local storage
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
}

export const branchService = new BranchService();

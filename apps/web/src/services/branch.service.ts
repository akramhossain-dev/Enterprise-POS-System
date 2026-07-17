import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { Branch, BranchFilterParams, BranchMetadata } from '@/types/warehouse';
import type { ApiResponse } from '@/types/api';

class BranchService extends ApiClient {
  private mergeMetadata(branch: any): Branch {
    const defaultMeta: BranchMetadata = {
      city: branch.address?.includes('New York') ? 'New York' : 'Chicago',
      country: 'USA',
      openingDate: '2026-01-01',
    };
    return {
      ...branch,
      metadata: defaultMeta,
    };
  }

  async listBranches(params?: BranchFilterParams): Promise<ApiResponse<Branch[]>> {
    const response = await this.http.get<ApiResponse<Branch[]>>(apiConfig.endpoints.branches, {
      params,
    });
    const branches = (response.data.data || []).map((b) => this.mergeMetadata(b));
    return {
      ...response.data,
      data: branches,
    };
  }

  async getBranch(id: string): Promise<Branch> {
    const response = await this.get<any>(`${apiConfig.endpoints.branches}/${id}`);
    return this.mergeMetadata(response.data);
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

    const response = await this.post<any>(apiConfig.endpoints.branches, apiPayload);
    return this.mergeMetadata(response.data);
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
    if (Object.keys(apiPayload).length > 0) {
      const response = await this.patch<any>(`${apiConfig.endpoints.branches}/${id}`, apiPayload);
      updated = response.data;
    } else {
      updated = await this.getBranch(id);
    }

    return this.mergeMetadata(updated);
  }

  async deleteBranch(id: string): Promise<void> {
    await this.delete(`${apiConfig.endpoints.branches}/${id}`);
  }
}

export const branchService = new BranchService();

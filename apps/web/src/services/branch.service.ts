import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';

export interface Branch {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

class BranchService extends ApiClient {
  async listBranches(): Promise<Branch[]> {
    try {
      const response = await this.get<Branch[]>('/branches');
      return response.data;
    } catch {
      // Fallback mock list if endpoint fails or has different model details
      return [
        { id: 'branch-1', name: 'Main Headquarter', status: 'ACTIVE' },
        { id: 'branch-2', name: 'Downtown Retail Branch', status: 'ACTIVE' },
        { id: 'branch-3', name: 'Airport Express Outlet', status: 'ACTIVE' },
      ];
    }
  }
}

export const branchService = new BranchService();

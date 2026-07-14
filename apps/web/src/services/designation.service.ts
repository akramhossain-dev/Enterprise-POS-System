import { Designation } from '@/types/employee';

const STORAGE_KEY = 'pos_designations';

const DEFAULT_DESIGNATIONS: Designation[] = [
  {
    id: 'desig-hr-mgr',
    name: 'HR Manager',
    departmentId: 'dept-hr',
    departmentName: 'Human Resources',
    description: 'Heads human resources department and manages corporate policies.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'desig-recruiter',
    name: 'Recruiter',
    departmentId: 'dept-hr',
    departmentName: 'Human Resources',
    description: 'Handles talent acquisition and staff onboarding processes.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'desig-finance-mgr',
    name: 'Finance Director',
    departmentId: 'dept-finance',
    departmentName: 'Finance & Accounting',
    description: 'Manages POS financial statements, cash drawers, and cash vaults.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'desig-accountant',
    name: 'Senior Accountant',
    departmentId: 'dept-finance',
    departmentName: 'Finance & Accounting',
    description: 'Prepares general ledger journal entries and tax returns.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'desig-ops-dir',
    name: 'Operations Manager',
    departmentId: 'dept-operations',
    departmentName: 'Operations',
    description: 'Manages warehouses, inventory levels, and logistics pipelines.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'desig-cashier',
    name: 'POS Cashier',
    departmentId: 'dept-sales',
    departmentName: 'Sales & Retail',
    description: 'Operates checkout registers, scans barcode items, and collects payments.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'desig-sales-rep',
    name: 'Retail Sales Rep',
    departmentId: 'dept-sales',
    departmentName: 'Sales & Retail',
    description: 'Assists customers on the store floor with product inquiries.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'desig-sysadmin',
    name: 'IT Administrator',
    departmentId: 'dept-it',
    departmentName: 'Information Technology',
    description: 'Maintains store software databases, local networks, and cloud access control.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class DesignationService {
  private getStorageDesignations(): Designation[] {
    if (typeof window === 'undefined') return DEFAULT_DESIGNATIONS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DESIGNATIONS));
      return DEFAULT_DESIGNATIONS;
    }
    return JSON.parse(stored) as Designation[];
  }

  private saveDesignations(desigs: Designation[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(desigs));
  }

  async listDesignations(): Promise<Designation[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.getStorageDesignations().filter((d) => d.status !== 'INACTIVE');
  }

  async listAllDesignations(): Promise<Designation[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.getStorageDesignations();
  }

  async getDesignation(id: string): Promise<Designation> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const desigs = this.getStorageDesignations();
    const desig = desigs.find((d) => d.id === id);
    if (!desig) throw new Error('Designation not found');
    return desig;
  }

  async createDesignation(
    payload: Omit<Designation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Designation> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const desigs = this.getStorageDesignations();
    const newDesig: Designation = {
      ...payload,
      id: `desig-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    desigs.push(newDesig);
    this.saveDesignations(desigs);
    return newDesig;
  }

  async updateDesignation(
    id: string,
    payload: Partial<Omit<Designation, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Designation> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const desigs = this.getStorageDesignations();
    const index = desigs.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Designation not found');

    const updated: Designation = {
      ...desigs[index]!,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    desigs[index] = updated;
    this.saveDesignations(desigs);
    return updated;
  }

  async deleteDesignation(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const desigs = this.getStorageDesignations();
    const updated = desigs.filter((d) => d.id !== id);
    this.saveDesignations(updated);
  }
}

export const designationService = new DesignationService();

import { Department } from '@/types/employee';

const STORAGE_KEY = 'pos_departments';

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'dept-hr',
    name: 'Human Resources',
    description: 'Manages employee onboarding, benefits, and employee relations.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-finance',
    name: 'Finance & Accounting',
    description: 'Responsible for salaries, invoicing, ledger reconciliations, and budgeting.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-operations',
    name: 'Operations',
    description: 'Manages warehouse management, product catalogs, and procurement.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-sales',
    name: 'Sales & Retail',
    description: 'Handles cashier desks, customer relationships, and POS checkout lanes.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-it',
    name: 'Information Technology',
    description: 'Supports store equipment, networking, and system security credentials.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class DepartmentService {
  private getStorageDepartments(): Department[] {
    if (typeof window === 'undefined') return DEFAULT_DEPARTMENTS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEPARTMENTS));
      return DEFAULT_DEPARTMENTS;
    }
    return JSON.parse(stored) as Department[];
  }

  private saveDepartments(depts: Department[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(depts));
  }

  async listDepartments(): Promise<Department[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.getStorageDepartments().filter((d) => d.status !== 'INACTIVE');
  }

  async listAllDepartments(): Promise<Department[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.getStorageDepartments();
  }

  async getDepartment(id: string): Promise<Department> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const depts = this.getStorageDepartments();
    const dept = depts.find((d) => d.id === id);
    if (!dept) throw new Error('Department not found');
    return dept;
  }

  async createDepartment(
    payload: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Department> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const depts = this.getStorageDepartments();
    const newDept: Department = {
      ...payload,
      id: `dept-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    depts.push(newDept);
    this.saveDepartments(depts);
    return newDept;
  }

  async updateDepartment(
    id: string,
    payload: Partial<Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Department> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const depts = this.getStorageDepartments();
    const index = depts.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Department not found');

    const updated: Department = {
      ...depts[index]!,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    depts[index] = updated;
    this.saveDepartments(depts);
    return updated;
  }

  async deleteDepartment(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const depts = this.getStorageDepartments();
    const updated = depts.filter((d) => d.id !== id);
    this.saveDepartments(updated);
  }
}

export const departmentService = new DepartmentService();

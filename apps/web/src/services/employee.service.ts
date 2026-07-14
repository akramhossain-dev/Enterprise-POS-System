import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { Employee, EmployeeFilterParams, EmployeeMetadata } from '@/types/employee';
import type { ApiResponse } from '@/types/api';

const STORAGE_METADATA_KEY = 'pos_employees_metadata';

class EmployeeService extends ApiClient {
  private getEmployeesMetadata(): Record<string, EmployeeMetadata> {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(STORAGE_METADATA_KEY);
    return stored ? (JSON.parse(stored) as Record<string, EmployeeMetadata>) : {};
  }

  private saveEmployeeMetadata(id: string, metadata: EmployeeMetadata): void {
    if (typeof window === 'undefined') return;
    const all = this.getEmployeesMetadata();
    all[id] = {
      ...(all[id] || {}),
      ...metadata,
    };
    localStorage.setItem(STORAGE_METADATA_KEY, JSON.stringify(all));
  }

  private mergeMetadata(employee: any): Employee {
    const allMeta = this.getEmployeesMetadata();
    const meta = allMeta[employee.id] || null;
    return {
      ...employee,
      fullName: `${employee.firstName} ${employee.lastName}`,
      metadata: meta,
    };
  }

  async listEmployees(params?: EmployeeFilterParams): Promise<ApiResponse<Employee[]>> {
    const response = await this.http.get<ApiResponse<Employee[]>>(apiConfig.endpoints.employees, {
      params,
    });

    // Merge client-side metadata for all returned employees
    const employees = response.data.data.map((emp) => this.mergeMetadata(emp));

    // Filter client-side by department and designation if parameters are provided
    let filtered = employees;
    if (params?.departmentId) {
      filtered = filtered.filter((emp) => emp.metadata?.departmentId === params.departmentId);
    }
    if (params?.designationId) {
      filtered = filtered.filter((emp) => emp.metadata?.designationId === params.designationId);
    }

    return {
      ...response.data,
      data: filtered,
      meta: {
        page: response.data.meta?.page ?? params?.page ?? 1,
        pageSize: response.data.meta?.pageSize ?? params?.limit ?? 20,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / (params?.limit ?? 20)),
        hasNextPage: response.data.meta?.hasNextPage ?? false,
        hasPrevPage: response.data.meta?.hasPrevPage ?? false,
      },
    };
  }

  async getEmployee(id: string): Promise<Employee> {
    const response = await this.get<any>(`${apiConfig.endpoints.employees}/${id}`);
    return this.mergeMetadata(response.data);
  }

  async createEmployee(
    payload: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> & { metadata?: EmployeeMetadata },
  ): Promise<Employee> {
    // Extract Zod-validated base fields for the backend API
    const apiPayload = {
      companyId: payload.companyId,
      branchId: payload.branchId,
      userId: payload.userId || undefined,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone || undefined,
      email: payload.email || undefined,
      hireDate: payload.hireDate || undefined,
    };

    const response = await this.post<any>(apiConfig.endpoints.employees, apiPayload);
    const createdEmp = response.data;

    // Save extended fields in metadata storage
    if (payload.metadata) {
      this.saveEmployeeMetadata(createdEmp.id, payload.metadata);
    }

    return this.mergeMetadata(createdEmp);
  }

  async updateEmployee(
    id: string,
    payload: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>> & {
      metadata?: Partial<EmployeeMetadata>;
    },
  ): Promise<Employee> {
    const apiPayload: any = {};
    if (payload.branchId !== undefined) apiPayload.branchId = payload.branchId;
    if (payload.userId !== undefined) apiPayload.userId = payload.userId;
    if (payload.firstName !== undefined) apiPayload.firstName = payload.firstName;
    if (payload.lastName !== undefined) apiPayload.lastName = payload.lastName;
    if (payload.phone !== undefined) apiPayload.phone = payload.phone;
    if (payload.email !== undefined) apiPayload.email = payload.email;
    if (payload.hireDate !== undefined) apiPayload.hireDate = payload.hireDate;
    if (payload.status !== undefined) apiPayload.status = payload.status;

    // Check if we need to call API update (only if we have base fields to update)
    let updatedEmp = null;
    if (Object.keys(apiPayload).length > 0) {
      const response = await this.patch<any>(`${apiConfig.endpoints.employees}/${id}`, apiPayload);
      updatedEmp = response.data;
    } else {
      updatedEmp = await this.getEmployee(id);
    }

    // Save extended metadata updates
    if (payload.metadata) {
      this.saveEmployeeMetadata(id, payload.metadata as EmployeeMetadata);
    }

    return this.mergeMetadata(updatedEmp);
  }

  async deleteEmployee(id: string): Promise<void> {
    await this.delete(`${apiConfig.endpoints.employees}/${id}`);
  }
}

export const employeeService = new EmployeeService();

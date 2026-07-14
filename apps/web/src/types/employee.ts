export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Department {
  id: string;
  name: string;
  headId?: string | null;
  headName?: string | null;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Designation {
  id: string;
  name: string;
  departmentId: string;
  departmentName?: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeMetadata {
  photoUrl?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  nationalId?: string | null;
  departmentId?: string | null;
  designationId?: string | null;
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | null;
  salary?: number | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  notes?: string | null;
}

export interface Employee {
  id: string;
  companyId: string;
  branchId: string;
  branch?: { id: string; name: string };
  userId?: string | null;
  user?: { id: string; name: string; email: string } | null;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string | null;
  email?: string | null;
  hireDate?: string | null;
  status: EmployeeStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Extended UI metadata fields
  metadata?: EmployeeMetadata | null;
}

export interface EmployeeFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: EmployeeStatus;
  branchId?: string;
  departmentId?: string;
  designationId?: string;
}

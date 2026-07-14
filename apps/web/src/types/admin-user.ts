import type { UserStatus, UserRole } from './auth';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DELETED';
  roleId: string;
  role: {
    id: string;
    name: string;
    description?: string | null;
  };
  employeeId?: string | null;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  roleId?: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  action: string;
  resource: string;
  ipAddress?: string | null;
  device?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface LoginHistory {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  browser?: string | null;
  os?: string | null;
  device?: string | null;
  status: 'SUCCESS' | 'FAILED';
  failureReason?: string | null;
  createdAt: string;
}

// ============================================================
// AUTH TYPES
// ============================================================

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'cashier' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string | null;
  phone?: string | null;
  bio?: string | null;
  timezone?: string;
  role: UserRole;
  roles: string[];
  permissions: string[];
  status: UserStatus;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  workspaceId?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface TwoFactorPayload {
  code: string;
  useBackupCode?: boolean;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  timezone?: string;
}

// ============================================================
// SESSION TYPES
// ============================================================

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location?: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

// ============================================================
// RBAC TYPES
// ============================================================

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
}

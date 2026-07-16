'use client';

import React from 'react';
import { useAuthStore } from '@/stores/auth.store';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  roles?: string[];
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  role,
  roles,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasRole, hasAnyRole, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
export default PermissionGuard;

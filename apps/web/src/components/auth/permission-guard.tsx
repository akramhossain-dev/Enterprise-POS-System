'use client';

import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { ForbiddenFallback } from './forbidden-fallback';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the user has the specified permission.
 * Shows ForbiddenFallback (or custom fallback) otherwise.
 */
export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = useAuthStore();

  if (!hasPermission(permission)) {
    return <>{fallback ?? <ForbiddenFallback />}</>;
  }

  return <>{children}</>;
}

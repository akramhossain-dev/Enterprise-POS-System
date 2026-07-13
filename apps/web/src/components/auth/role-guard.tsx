'use client';

import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import type { UserRole } from '@/types/auth';
import { ForbiddenFallback } from './forbidden-fallback';

interface RoleGuardProps {
  roles: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the user has one of the specified roles.
 */
export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const { hasAnyRole } = useAuthStore();

  const allowed = hasAnyRole(Array.isArray(roles) ? roles : [roles]);

  if (!allowed) {
    return <>{fallback ?? <ForbiddenFallback />}</>;
  }

  return <>{children}</>;
}

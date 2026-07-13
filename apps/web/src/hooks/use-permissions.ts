import { useAuthStore } from '@/stores/auth.store';

/**
 * Permissions hook for fine-grained access control.
 */
export function usePermissions() {
  const { user, hasPermission, hasRole, hasAnyRole } = useAuthStore();

  return {
    user,
    can: hasPermission,
    hasRole,
    hasAnyRole,
    isAdmin: hasRole('admin') || hasRole('super_admin'),
    isSuperAdmin: hasRole('super_admin'),
    isManager: hasRole('manager'),
    isCashier: hasRole('cashier'),
  };
}

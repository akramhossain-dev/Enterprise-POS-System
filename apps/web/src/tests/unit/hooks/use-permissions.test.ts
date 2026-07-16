import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/types/auth';

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'admin',
  roles: ['admin', 'manager'],
  permissions: ['pos:access'],
  workspaceId: 'ws_123',
};

describe('usePermissions Hook', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should return initial flag states when guest (no user)', () => {
    const { result } = renderHook(() => usePermissions());

    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.isManager).toBe(false);
    expect(result.current.isCashier).toBe(false);
    expect(result.current.can('pos:access')).toBe(false);
  });

  it('should map roles and permissions correctly when authenticated', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isManager).toBe(true);
    expect(result.current.isCashier).toBe(false);
    expect(result.current.can('pos:access')).toBe(true);
    expect(result.current.can('accounting:write')).toBe(false);
  });
});

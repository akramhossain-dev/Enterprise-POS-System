import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/types/auth';

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  role: 'admin',
  roles: ['admin', 'manager'],
  permissions: ['pos:access', 'reports:read'],
  status: 'active',
  workspaceId: 'ws_123',
  createdAt: '2026-07-16T17:00:00Z',
  updatedAt: '2026-07-16T17:00:00Z',
};

describe('useAuthStore (zustand)', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout();
    useAuthStore.setState({
      isLoading: false,
      isInitialized: false,
    });
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.isInitialized).toBe(false);
  });

  it('should setUser and update isAuthenticated', () => {
    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);

    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('should setAuthenticated', () => {
    useAuthStore.getState().setAuthenticated(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('should setLoading', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
  });

  it('should setInitialized', () => {
    useAuthStore.getState().setInitialized(true);
    expect(useAuthStore.getState().isInitialized).toBe(true);
  });

  it('should logout and clear authentication status', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should check permissions via hasPermission helper', () => {
    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();

    expect(state.hasPermission('pos:access')).toBe(true);
    expect(state.hasPermission('reports:read')).toBe(true);
    expect(state.hasPermission('accounting:write')).toBe(false);

    // Should return false if no user is authenticated
    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().hasPermission('pos:access')).toBe(false);
  });

  it('should check roles via hasRole helper', () => {
    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();

    expect(state.hasRole('admin')).toBe(true);
    expect(state.hasRole('manager')).toBe(true);
    expect(state.hasRole('cashier')).toBe(false);

    // Should return false if no user is authenticated
    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().hasRole('admin')).toBe(false);
  });

  it('should check multiple roles via hasAnyRole helper', () => {
    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();

    expect(state.hasAnyRole(['admin', 'cashier'])).toBe(true);
    expect(state.hasAnyRole(['cashier', 'guest'])).toBe(false);

    // Should return false if no user is authenticated
    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().hasAnyRole(['admin'])).toBe(false);
  });
});

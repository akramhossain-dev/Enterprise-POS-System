import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/tests/utils';
import { PermissionGuard } from '@/components/common/permission-guard';
import { useAuthStore } from '@/stores/auth.store';

// Mock the auth store
vi.mock('@/stores/auth.store');

const mockUseAuthStore = vi.mocked(useAuthStore);

function setupStore(overrides: Partial<ReturnType<typeof useAuthStore>> = {}) {
  mockUseAuthStore.mockReturnValue({
    user: {
      id: '1',
      email: 'a@b.com',
      role: 'admin',
      roles: ['admin'],
      permissions: ['products.read'],
    } as never,
    isAuthenticated: true,
    isLoading: false,
    isInitialized: true,
    hasPermission: (p: string) => ['products.read', 'products.write'].includes(p),
    hasRole: (r: string) => r === 'admin',
    hasAnyRole: (roles: string[]) => roles.includes('admin'),
    setUser: vi.fn(),
    setAuthenticated: vi.fn(),
    setLoading: vi.fn(),
    setInitialized: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
}

describe('PermissionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStore();
  });

  it('renders children when no restriction is given and user is authenticated', () => {
    render(
      <PermissionGuard>
        <span>Protected Content</span>
      </PermissionGuard>,
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user has the required permission', () => {
    render(
      <PermissionGuard permission="products.read">
        <span>Read Products</span>
      </PermissionGuard>,
    );
    expect(screen.getByText('Read Products')).toBeInTheDocument();
  });

  it('renders fallback when user lacks the required permission', () => {
    render(
      <PermissionGuard permission="invoices.delete" fallback={<span>No Access</span>}>
        <span>Sensitive Action</span>
      </PermissionGuard>,
    );
    expect(screen.queryByText('Sensitive Action')).not.toBeInTheDocument();
    expect(screen.getByText('No Access')).toBeInTheDocument();
  });

  it('renders children when user has the required role', () => {
    render(
      <PermissionGuard role="admin">
        <span>Admin Panel</span>
      </PermissionGuard>,
    );
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('renders fallback when user does not have the required role', () => {
    render(
      <PermissionGuard role="superadmin" fallback={<span>Not Authorized</span>}>
        <span>Super Content</span>
      </PermissionGuard>,
    );
    expect(screen.queryByText('Super Content')).not.toBeInTheDocument();
    expect(screen.getByText('Not Authorized')).toBeInTheDocument();
  });

  it('renders fallback when user has none of the required roles', () => {
    render(
      <PermissionGuard roles={['superadmin', 'finance']} fallback={<span>Blocked</span>}>
        <span>Finance Content</span>
      </PermissionGuard>,
    );
    expect(screen.queryByText('Finance Content')).not.toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('renders null (not fallback) when unauthenticated and no fallback provided', () => {
    setupStore({
      isAuthenticated: false,
      hasPermission: () => false,
      hasRole: () => false,
      hasAnyRole: () => false,
    });
    const { container } = render(
      <PermissionGuard permission="products.read">
        <span>Secret</span>
      </PermissionGuard>,
    );
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });
});

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

interface RawUser {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string | null;
  role?: string | { name: string } | null;
  roles?: string[];
  permissions?: string[];
  status?: string;
  avatar?: string | null;
  bio?: string | null;
  timezone?: string | null;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  workspaceId?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,

        setUser: (user: RawUser | null) => {
          if (!user) {
            set({ user: null, isAuthenticated: false }, false, 'auth/setUser');
            return;
          }

          // Parse name into firstName and lastName, or keep existing ones
          const nameParts = (user.name || '').trim().split(/\s+/);
          const firstName = user.firstName || nameParts[0] || '';
          const lastName = user.lastName || nameParts.slice(1).join(' ') || '';
          const fullName = user.fullName || user.name || '';

          // Normalize role
          let roleName = '';
          if (user.role && typeof user.role === 'object') {
            roleName = user.role.name || '';
          } else if (typeof user.role === 'string') {
            roleName = user.role;
          }
          const role = roleName.toLowerCase() as User['role'];
          const roles =
            user.roles && user.roles.length > 0
              ? (user.roles.map((r) => r.toLowerCase()) as User['role'][])
              : [role];

          const mappedUser: User = {
            id: user.id,
            email: user.email,
            firstName,
            lastName,
            fullName,
            phone: user.phone || null,
            role,
            roles,
            permissions: user.permissions || [],
            status: (user.status || 'active').toLowerCase() as User['status'],
            avatar: user.avatar || null,
            bio: user.bio || null,
            timezone: user.timezone,
            emailVerified: user.emailVerified ?? true,
            twoFactorEnabled: user.twoFactorEnabled ?? false,
            workspaceId: user.workspaceId,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || new Date().toISOString(),
          };

          set({ user: mappedUser, isAuthenticated: true }, false, 'auth/setUser');
        },

        setAuthenticated: (isAuthenticated) =>
          set({ isAuthenticated }, false, 'auth/setAuthenticated'),

        setLoading: (isLoading) => set({ isLoading }, false, 'auth/setLoading'),

        setInitialized: (isInitialized) => set({ isInitialized }, false, 'auth/setInitialized'),

        logout: () => set({ user: null, isAuthenticated: false }, false, 'auth/logout'),

        hasPermission: (permission) => {
          const { user } = get();
          if (!user) return false;
          return user.permissions.includes(permission);
        },

        hasRole: (role) => {
          const { user } = get();
          if (!user) return false;
          return user.role === role || user.roles.includes(role);
        },

        hasAnyRole: (roles) => {
          const { user } = get();
          if (!user) return false;
          return roles.some((r) => user.role === r || user.roles.includes(r));
        },
      }),
      {
        name: 'epos_auth',
        storage: createJSONStorage(() => sessionStorage),
        // Only persist non-sensitive info (no tokens)
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);

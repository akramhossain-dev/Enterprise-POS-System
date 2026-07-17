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

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,

        setUser: (user: any) => {
          if (!user) {
            set({ user: null, isAuthenticated: false }, false, 'auth/setUser');
            return;
          }

          // Parse name into firstName and lastName
          const nameParts = (user.name || '').trim().split(/\s+/);
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          const fullName = user.name || '';

          // Normalize role
          let roleName = '';
          if (user.role && typeof user.role === 'object') {
            roleName = user.role.name || '';
          } else if (typeof user.role === 'string') {
            roleName = user.role;
          }
          const role = roleName.toLowerCase() as any;

          const mappedUser: User = {
            id: user.id,
            email: user.email,
            firstName,
            lastName,
            fullName,
            phone: user.phone,
            role,
            roles: [role],
            permissions: user.permissions || [],
            status: (user.status || 'active').toLowerCase() as any,
            avatar: user.avatar,
            bio: user.bio,
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

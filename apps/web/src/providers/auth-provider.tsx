'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { authConfig } from '@/config/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setAuthenticated, setLoading, setInitialized, logout } = useAuthStore();

  const initializeAuth = useCallback(async () => {
    setLoading(true);
    try {
      const user = await authService.getMe();
      setUser(user);
      setAuthenticated(true);
    } catch {
      // Not authenticated or token expired — clear session cookies on backend
      try {
        await authService.logout();
      } catch {
        // ignore
      }
      logout();
      setAuthenticated(false);

      const isProtectedRoute = authConfig.protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + '/'),
      );
      if (isProtectedRoute) {
        router.push(authConfig.routes.login);
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [setUser, setAuthenticated, setLoading, setInitialized, logout, pathname, router]);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  // Handle auth state changes (session restore on window focus)
  useEffect(() => {
    const handleFocus = () => {
      void initializeAuth();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [initializeAuth, router]);

  return <>{children}</>;
}

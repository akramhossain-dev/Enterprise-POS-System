'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { authConfig } from '@/config/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const { setUser, setAuthenticated, setLoading, setInitialized, logout } = useAuthStore();

  const initializeAuth = useCallback(async () => {
    setLoading(true);
    try {
      const user = await authService.getMe();
      setUser(user);
      setAuthenticated(true);
    } catch {
      // Not authenticated or token expired
      logout();
      setAuthenticated(false);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [setUser, setAuthenticated, setLoading, setInitialized, logout]);

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

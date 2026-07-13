'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authConfig } from '@/config/auth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wraps protected pages.
 * Redirects to /login if the user is not authenticated.
 * Shows loading state while auth is initializing.
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push(authConfig.routes.login);
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized) {
    return (
      fallback ?? (
        <div className="min-h-dvh flex items-center justify-center">
          <Spinner size="lg" className="text-primary" />
        </div>
      )
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

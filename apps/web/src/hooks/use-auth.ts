import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { authConfig } from '@/config/auth';
import { toast } from 'sonner';

/**
 * Primary auth hook — exposes auth state and actions.
 */
export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    store.setLoading(true);
    try {
      const { user } = await authService.login({ email, password });
      store.setUser(user);
      store.setAuthenticated(true);
      router.push(authConfig.routes.dashboard);
      toast.success(`Welcome back, ${user.firstName}!`);
    } catch (error) {
      store.setAuthenticated(false);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      store.logout();
      router.push(authConfig.routes.login);
      toast.success('Signed out successfully');
    }
  };

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    login,
    logout,
    hasPermission: store.hasPermission,
    hasRole: store.hasRole,
    hasAnyRole: store.hasAnyRole,
  };
}

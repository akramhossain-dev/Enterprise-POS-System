'use client';

import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, ChevronDown, Shield } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { authConfig } from '@/config/auth';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout errors
    } finally {
      logout();
      router.push(authConfig.routes.login);
      toast.success('Signed out successfully');
    }
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-lg',
            'text-sm text-foreground hover:bg-accent transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label="User menu"
          id="user-menu-trigger"
        >
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-xs font-semibold">{initials}</span>
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p className="text-xs font-medium leading-none truncate max-w-[100px]">
              {user?.firstName ?? 'User'}
            </p>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5 truncate max-w-[100px]">
              {user?.role ?? '—'}
            </p>
          </div>
          <ChevronDown
            className="w-3.5 h-3.5 text-muted-foreground hidden sm:block"
            aria-hidden="true"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-[1060] min-w-[200px] rounded-xl border border-border bg-popover p-1 shadow-lg',
            'animate-scale-in',
          )}
          sideOffset={8}
          align="end"
        >
          {/* User info */}
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-semibold text-popover-foreground">
              {user?.fullName ?? user?.firstName ?? 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ''}</p>
          </div>

          <DropdownMenu.Item asChild>
            <a
              href="/settings/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer outline-none transition-colors"
            >
              <User className="w-4 h-4" aria-hidden="true" />
              Profile
            </a>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <a
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer outline-none transition-colors"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              Settings
            </a>
          </DropdownMenu.Item>

          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <DropdownMenu.Item asChild>
              <a
                href="/settings/roles"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer outline-none transition-colors"
              >
                <Shield className="w-4 h-4" aria-hidden="true" />
                Roles & Permissions
              </a>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item
            onSelect={() => void handleLogout()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-backgroundestructive/10 cursor-pointer outline-none transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

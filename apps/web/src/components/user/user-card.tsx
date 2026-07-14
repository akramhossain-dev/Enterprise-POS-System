'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  Shield,
  UserX,
  Lock,
  Unlock,
  Key,
  RefreshCw,
} from 'lucide-react';
import type { AdminUser } from '@/types/admin-user';
import { RoleBadge } from './role-badge';
import { cn } from '@/utils/cn';

interface UserCardProps {
  user: AdminUser;
  onLockToggle: (id: string, currentlyLocked: boolean) => void;
  onStatusToggle: (id: string, currentStatus: string) => void;
  onResetPassword: (id: string) => void;
}

export function UserCard({ user, onLockToggle, onStatusToggle, onResetPassword }: UserCardProps) {
  const initials =
    user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const isLocked = user.status === 'INACTIVE'; // Lock logic mapped by status in this client iteration

  return (
    <div className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary text-sm">
            {initials}
            <span
              className={cn(
                'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card',
                user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500',
              )}
            />
          </div>

          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1">
              {user.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <RoleBadge roleName={user.role?.name || 'Staff'} />
            </div>
          </div>
        </div>

        {/* Lock/Unlock indicator */}
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase border',
            isLocked
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          )}
        >
          {isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
          {isLocked ? 'Locked' : 'Unlocked'}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span>{user.phone}</span>
          </div>
        )}
        {user.lastLoginAt && (
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span>Last Login: {new Date(user.lastLoginAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Quick Action Matrix Panel */}
      <div className="mt-5 grid grid-cols-4 gap-1.5 border-t border-border/50 pt-4">
        <button
          onClick={() => onLockToggle(user.id, !isLocked)}
          className={cn(
            'flex flex-col items-center justify-center p-2 rounded-lg border border-border/50 text-[10px] font-medium transition-all hover:bg-muted',
            isLocked
              ? 'text-emerald-500 hover:border-emerald-500/30'
              : 'text-rose-500 hover:border-rose-500/30',
          )}
          title={isLocked ? 'Unlock User Account' : 'Lock User Account'}
        >
          {isLocked ? <Unlock className="w-4 h-4 mb-1" /> : <Lock className="w-4 h-4 mb-1" />}
          {isLocked ? 'Unlock' : 'Lock'}
        </button>

        <button
          onClick={() => onStatusToggle(user.id, user.status)}
          className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/50 text-[10px] font-medium transition-all hover:bg-muted text-muted-foreground hover:text-foreground"
          title={user.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
        >
          <UserX className="w-4 h-4 mb-1" />
          {user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
        </button>

        <button
          onClick={() => onResetPassword(user.id)}
          className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/50 text-[10px] font-medium transition-all hover:bg-muted text-muted-foreground hover:text-foreground"
          title="Force Reset Password"
        >
          <Key className="w-4 h-4 mb-1" />
          Reset PW
        </button>

        <Link
          href={`/users/${user.id}`}
          className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/50 text-[10px] font-medium transition-all hover:bg-primary/10 hover:border-primary/30 text-primary hover:text-primary-foreground"
          title="Manage Account Profiles"
        >
          <ArrowRight className="w-4 h-4 mb-1" />
          Details
        </Link>
      </div>
    </div>
  );
}

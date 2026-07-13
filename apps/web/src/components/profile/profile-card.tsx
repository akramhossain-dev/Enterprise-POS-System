'use client';

import { formatRelative, formatDate } from '@/utils/format';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Clock, Calendar } from 'lucide-react';
import type { User } from '@/types/auth';
import { titleCase } from '@/utils/format';
import { cn } from '@/utils/cn';

const ROLE_COLORS: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> =
  {
    super_admin: 'destructive',
    admin: 'warning',
    manager: 'default',
    cashier: 'secondary',
    viewer: 'secondary',
  };

interface ProfileCardProps {
  user: User;
  className?: string;
}

export function ProfileCard({ user, className }: ProfileCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header gradient */}
      <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-violet-500/10" />

      <CardContent className="relative pt-0 pb-6">
        {/* Avatar overlapping the header */}
        <div className="-mt-10 mb-4 flex items-end justify-between">
          <Avatar
            src={user.avatar ?? undefined}
            alt={user.fullName}
            fallback={`${user.firstName[0]}${user.lastName[0]}`}
            size="xl"
            className="ring-4 ring-background shadow-lg"
          />
          <Badge variant={ROLE_COLORS[user.role] ?? 'secondary'} className="mb-1">
            <Shield className="w-3 h-3 mr-1" />
            {titleCase(user.role)}
          </Badge>
        </div>

        {/* Name & email */}
        <div className="space-y-1 mb-4">
          <h2 className="text-xl font-semibold text-foreground">{user.fullName}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.bio && <p className="text-sm text-foreground/80 mt-2">{user.bio}</p>}
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Last login {user.lastLoginAt ? formatRelative(user.lastLoginAt) : 'Never'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              user.status === 'active' ? 'bg-success' : 'bg-muted-foreground',
            )}
          />
          <span className="text-xs text-muted-foreground capitalize">{user.status}</span>
          {user.emailVerified && (
            <Badge variant="outline" className="text-xs ml-auto">
              Email verified
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

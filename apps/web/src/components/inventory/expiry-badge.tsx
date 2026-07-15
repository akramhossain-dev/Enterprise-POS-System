'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { AlertTriangle, ShieldCheck, Skull } from 'lucide-react';

interface ExpiryBadgeProps {
  expiryDate?: string | Date | null;
  className?: string;
}

export function ExpiryBadge({ expiryDate, className }: ExpiryBadgeProps) {
  if (!expiryDate) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-muted-foreground bg-muted/20 border-muted/30 font-normal rounded-full px-2 py-0.5',
          className,
        )}
      >
        No Expiry
      </Badge>
    );
  }

  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let variant: 'EXPIRED' | 'EXPIRING_SOON' | 'SAFE' = 'SAFE';
  if (diffDays <= 0) {
    variant = 'EXPIRED';
  } else if (diffDays <= 30) {
    variant = 'EXPIRING_SOON';
  }

  const CONFIG = {
    EXPIRED: {
      label: `Expired (${Math.abs(diffDays)}d ago)`,
      icon: Skull,
      className: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20',
    },
    EXPIRING_SOON: {
      label: `Expiring soon (${diffDays}d left)`,
      icon: AlertTriangle,
      className: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20',
    },
    SAFE: {
      label: `${diffDays} days remaining`,
      icon: ShieldCheck,
      className: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20',
    },
  };

  const current = CONFIG[variant];
  const Icon = current.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium text-xs rounded-full px-2.5 py-0.5 border shadow-sm transition-all duration-300 gap-1 inline-flex items-center',
        current.className,
        className,
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {current.label}
    </Badge>
  );
}

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

interface BalanceBadgeProps {
  type: 'DEBIT' | 'CREDIT' | 'ACTIVE' | 'ARCHIVED' | 'INACTIVE';
  className?: string;
}

export function BalanceBadge({ type, className }: BalanceBadgeProps) {
  const getColors = () => {
    switch (type) {
      case 'DEBIT':
        return 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400';
      case 'CREDIT':
        return 'bg-amber-955/40 border-amber-900/60 text-amber-400';
      case 'ACTIVE':
        return 'bg-emerald-950/30 border-emerald-900/40 text-emerald-450';
      case 'ARCHIVED':
      case 'INACTIVE':
        return 'bg-slate-900 border-slate-800 text-slate-500';
      default:
        return 'bg-slate-900 text-slate-400';
    }
  };

  return (
    <Badge
      className={cn(
        'text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border',
        getColors(),
        className,
      )}
    >
      {type}
    </Badge>
  );
}

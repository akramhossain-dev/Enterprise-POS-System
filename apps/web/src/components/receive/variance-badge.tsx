'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface VarianceBadgeProps {
  value: number;
  type: 'quantity' | 'price';
  className?: string;
}

export function VarianceBadge({ value, type, className }: VarianceBadgeProps) {
  const isMatch = value === 0;

  if (isMatch) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold text-[10px] gap-1 px-2 py-0.5 rounded-full',
          className,
        )}
      >
        <CheckCircle2 className="w-3 h-3" />
        Match
      </Badge>
    );
  }

  const label =
    type === 'price' ? `$${Math.abs(value).toFixed(2)}` : `${value > 0 ? '+' : ''}${value}`;
  const isAlert = type === 'price' ? Math.abs(value) > 0.01 : Math.abs(value) > 0;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-bold text-[10px] gap-1 px-2 py-0.5 rounded-full shadow-sm',
        isAlert
          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          : 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        className,
      )}
    >
      <AlertTriangle className="w-3 h-3" />
      {label} {type === 'price' ? 'Price Var.' : 'Qty Mismatch'}
    </Badge>
  );
}

'use client';

import { cn } from '@/utils/cn';
import { Plus, Minus, Check } from 'lucide-react';

interface DifferenceIndicatorProps {
  systemQuantity: number;
  physicalQuantity: number | null;
  className?: string;
}

export function DifferenceIndicator({
  systemQuantity,
  physicalQuantity,
  className,
}: DifferenceIndicatorProps) {
  if (physicalQuantity === null) {
    return <span className="text-muted-foreground/60">—</span>;
  }

  const diff = physicalQuantity - systemQuantity;

  if (diff === 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10',
          className,
        )}
      >
        <Check className="w-3.5 h-3.5" /> Balanced
      </span>
    );
  }

  const isSurplus = diff > 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded border shadow-sm',
        isSurplus
          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        className,
      )}
    >
      {isSurplus ? (
        <>
          <Plus className="w-3 h-3" />
          {diff.toFixed(2)}
        </>
      ) : (
        <>
          <Minus className="w-3 h-3" />
          {Math.abs(diff).toFixed(2)}
        </>
      )}
    </span>
  );
}

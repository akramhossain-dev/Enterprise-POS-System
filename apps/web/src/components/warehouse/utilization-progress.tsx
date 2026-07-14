'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface UtilizationProgressProps {
  value: number; // percentage (0 to 100)
  className?: string;
  showLabel?: boolean;
}

export function UtilizationProgress({
  value,
  className,
  showLabel = true,
}: UtilizationProgressProps) {
  const roundedValue = Math.min(Math.max(Math.round(value), 0), 100);

  let progressColor = 'bg-emerald-500';
  let textColor = 'text-emerald-500';
  let trackColor = 'bg-emerald-500/10';

  if (roundedValue >= 90) {
    progressColor = 'bg-rose-500';
    textColor = 'text-rose-500';
    trackColor = 'bg-rose-500/10';
  } else if (roundedValue >= 70) {
    progressColor = 'bg-amber-500';
    textColor = 'text-amber-500';
    trackColor = 'bg-amber-500/10';
  }

  return (
    <div className={cn('w-full space-y-1.5 text-left', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-muted-foreground">Space Utilization</span>
          <span className={cn('font-mono font-bold', textColor)}>{roundedValue}%</span>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className={cn('h-2.5 w-full rounded-full overflow-hidden', trackColor)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', progressColor)}
          style={{ width: `${roundedValue}%` }}
        />
      </div>
    </div>
  );
}

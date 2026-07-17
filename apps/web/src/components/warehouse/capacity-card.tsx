'use client';

import React from 'react';
import { Layers, HardDrive, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { UtilizationProgress } from './utilization-progress';
import { cn } from '@/utils/cn';

interface CapacityCardProps {
  capacity: number; // in cubic meters
  utilization: number; // percentage (0 - 100)
  storageType?: string | null;
  className?: string;
}

export function CapacityCard({
  capacity,
  utilization,
  storageType = 'DRY',
  className,
}: CapacityCardProps) {
  const utilizedVolume = Math.round((capacity * utilization) / 100);
  const remainingVolume = capacity - utilizedVolume;
  const isOverCapacity = utilization >= 90;

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-cardard p-5 space-y-4 shadow-sm text-left',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl',
              isOverCapacity ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary',
            )}
          >
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">Capacity Profile</h4>
            <span className="block text-[10px] text-muted-foreground mt-0.5 font-mono uppercase tracking-wider">
              Type: {storageType?.replace(/_/g, ' ') || 'DRY'}
            </span>
          </div>
        </div>

        {/* Warning Indicator */}
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border',
            isOverCapacity
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          )}
        >
          {isOverCapacity ? (
            <ShieldAlert className="w-2.5 h-2.5" />
          ) : (
            <CheckCircle2 className="w-2.5 h-2.5" />
          )}
          {isOverCapacity ? 'Warning Fill' : 'Optimal Space'}
        </span>
      </div>

      <UtilizationProgress value={utilization} />

      {/* Numerical breakdown metrics */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
        <div className="bg-muted/30 p-2.5 rounded-xl text-center">
          <span className="block text-[9px] text-muted-foreground/80">Utilized Volume</span>
          <span className="block mt-1 font-bold text-foreground text-sm font-mono">
            {utilizedVolume.toLocaleString()} m³
          </span>
        </div>
        <div className="bg-muted/30 p-2.5 rounded-xl text-center">
          <span className="block text-[9px] text-muted-foreground/80 font-medium">
            Free Storage
          </span>
          <span className="block mt-1 font-bold text-foreground text-sm font-mono">
            {remainingVolume.toLocaleString()} m³
          </span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  growth?: number;
  isPositiveUp?: boolean;
  prefix?: string;
  suffix?: string;
  progressValue?: number; // e.g. 0 to 100 representing scale
  progressLabel?: string;
  infoText?: string;
  colorClass?: string;
  className?: string;
}

export function StatisticsCard({
  title,
  value,
  growth,
  isPositiveUp = true,
  prefix = '',
  suffix = '',
  progressValue,
  progressLabel,
  infoText,
  colorClass = 'text-foreground',
  className,
}: StatisticsCardProps) {
  const isUp = growth !== undefined ? growth >= 0 : true;
  const isOptimal = isPositiveUp ? isUp : !isUp;

  return (
    <Card className={cn('bg-card border-border text-foreground select-none text-left', className)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-sans">
                {title}
              </span>
              {infoText && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-slate-600 hover:text-muted-foreground focus:outline-none"
                      >
                        <Info className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-accent border-border text-[10px] text-foreground p-2 max-w-[200px]">
                      {infoText}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className={cn('text-lg font-black font-mono tracking-tight', colorClass)}>
              {prefix}
              {value}
              {suffix}
            </p>
          </div>

          {growth !== undefined && (
            <div
              className={cn(
                'flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold font-sans tracking-wide',
                isOptimal ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-455',
              )}
            >
              {isUp ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              <span>
                {isUp ? '+' : ''}
                {growth}%
              </span>
            </div>
          )}
        </div>

        {/* Progress level indicators */}
        {progressValue !== undefined && (
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isOptimal ? 'bg-emerald-500' : 'bg-amber-500',
                )}
                style={{ width: `${Math.min(progressValue, 100)}%` }}
              />
            </div>
            {progressLabel && (
              <span className="text-[9px] text-muted-foreground font-mono block text-right">
                {progressLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

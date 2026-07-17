'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FinancialKpiCardProps {
  label: string;
  value: number | string;
  change: string;
  isPositiveChange?: boolean;
  info?: string;
  sparklineData?: number[];
  color?: string;
  className?: string;
}

export function FinancialKpiCard({
  label,
  value,
  change,
  isPositiveChange = true,
  info,
  sparklineData = [10, 20, 15, 30, 25, 40],
  color = 'text-foreground',
  className,
}: FinancialKpiCardProps) {
  const isUp = isPositiveChange;

  return (
    <Card className={cn('bg-cardard border-border text-foreground', className)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-sans">
                {label}
              </span>
              {info && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-muted-foreground focus:outline-none"
                      >
                        <Info className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-accent border-border text-[10px] text-foreground p-2 max-w-[200px]">
                      {info}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className={cn('text-lg font-black font-mono tracking-tight', color)}>{value}</p>
          </div>

          <div
            className={cn(
              'flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold font-sans tracking-wide',
              isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-455',
            )}
          >
            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            <span>{change}</span>
          </div>
        </div>

        {/* Small SVG Sparkline Graph */}
        <div className="h-6 w-full flex items-end">
          <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={isUp ? 'rgba(52, 211, 153, 0.4)' : 'rgba(239, 68, 68, 0.4)'}
              strokeWidth="2"
              points={sparklineData
                .map((val, idx) => {
                  const x = (idx / (sparklineData.length - 1)) * 100;
                  const y = 20 - (val / Math.max(...sparklineData)) * 16 - 2;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

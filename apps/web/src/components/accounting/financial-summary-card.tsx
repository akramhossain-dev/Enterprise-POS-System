'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';

interface FinancialSummaryCardProps {
  label: string;
  value: number;
  change?: string;
  isPositiveChange?: boolean;
  icon: LucideIcon;
  color?: string;
}

export function FinancialSummaryCard({
  label,
  value,
  change,
  isPositiveChange = true,
  icon: Icon,
  color = 'text-emerald-400',
}: FinancialSummaryCardProps) {
  return (
    <Card className="bg-cardard border-border text-foreground text-left">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </CardTitle>
        <Icon className={cn('h-4 w-4', color)} />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-black font-mono text-foreground">
          ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {change && (
          <p
            className={cn(
              'text-[10px] mt-1 font-mono',
              isPositiveChange ? 'text-emerald-400' : 'text-rose-455',
            )}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

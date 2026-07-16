'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { Trophy, HelpCircle } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/analytics';

interface LeaderboardCardProps {
  title: string;
  data: LeaderboardEntry[];
  valueLabel?: string;
  metricPrefix?: string;
  metricSuffix?: string;
  className?: string;
}

export function LeaderboardCard({
  title,
  data,
  valueLabel = 'Revenue',
  metricPrefix = '$',
  metricSuffix = '',
  className,
}: LeaderboardCardProps) {
  const maxVal = data.length > 0 ? Math.max(...data.map((d) => d.amount)) : 1;

  const formatCurrency = (val: number) => {
    return val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  return (
    <Card
      className={cn(
        'bg-[#0c1220] border-slate-800 text-slate-100 select-none text-left',
        className,
      )}
    >
      <CardHeader className="py-4 border-b border-slate-900 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-widest font-sans flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-amber-500 animate-bounce" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {data.length > 0 ? (
          data.map((item, idx) => {
            const pct = (item.amount / maxVal) * 100;
            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-950 border border-slate-850 text-[10px] text-slate-400 font-bold">
                      {idx + 1}
                    </span>
                    <div className="text-left font-sans">
                      <p className="font-bold text-slate-200">{item.name}</p>
                      {item.secondaryInfo && (
                        <span className="text-[9px] text-slate-500 block leading-none">
                          {item.secondaryInfo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-200">
                      {metricPrefix}
                      {formatCurrency(item.amount)}
                      {metricSuffix}
                    </p>
                    {item.quantity !== undefined && (
                      <span className="text-[9px] text-slate-500 block leading-none">
                        Qty: {item.quantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar trend */}
                <div className="h-1.5 w-full bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      idx === 0
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : idx === 1
                          ? 'bg-gradient-to-r from-slate-400 to-slate-300'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No rankings logged for this segment.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

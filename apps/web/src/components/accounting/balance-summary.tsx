'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react';
import { cn } from '@/utils/cn';

interface BalanceSummaryProps {
  openingBalance: number;
  inflow: number;
  outflow: number;
  currentBalance: number;
  inflowLabel?: string;
  outflowLabel?: string;
  balanceLabel?: string;
  className?: string;
}

export function BalanceSummary({
  openingBalance,
  inflow,
  outflow,
  currentBalance,
  inflowLabel = 'Total Inflow',
  outflowLabel = 'Total Outflow',
  balanceLabel = 'Current Balance',
  className,
}: BalanceSummaryProps) {
  const formatCurrency = (val: number) => {
    return (
      '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
  };

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {/* Opening Balance Card */}
      <Card className="bg-[#0c1220] border-slate-800 text-slate-100 text-left">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Opening Balance
            </p>
            <p className="text-lg font-black font-mono text-slate-200">
              {formatCurrency(openingBalance)}
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-center shrink-0">
            <Wallet className="h-4 w-4 text-slate-450" />
          </div>
        </CardContent>
      </Card>

      {/* Inflow Card */}
      <Card className="bg-[#0c1220] border-slate-800 text-slate-100 text-left">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {inflowLabel}
            </p>
            <p className="text-lg font-black font-mono text-emerald-400">
              {formatCurrency(inflow)}
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
          </div>
        </CardContent>
      </Card>

      {/* Outflow Card */}
      <Card className="bg-[#0c1220] border-slate-800 text-slate-100 text-left">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {outflowLabel}
            </p>
            <p className="text-lg font-black font-mono text-rose-455">{formatCurrency(outflow)}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <ArrowUpRight className="h-4 w-4 text-rose-455" />
          </div>
        </CardContent>
      </Card>

      {/* Current Balance Card */}
      <Card className="bg-[#0c1220] border-slate-800 text-slate-100 text-left">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {balanceLabel}
            </p>
            <p className="text-lg font-black font-mono text-indigo-400">
              {formatCurrency(currentBalance)}
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Scale className="h-4 w-4 text-indigo-450" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

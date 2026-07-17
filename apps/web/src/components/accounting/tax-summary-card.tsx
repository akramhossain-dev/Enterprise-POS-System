'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { BadgePercent, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TaxSummaryCardProps {
  salesTax: number;
  purchaseTax: number;
  netLiability: number;
  periodLabel?: string;
  className?: string;
}

export function TaxSummaryCard({
  salesTax,
  purchaseTax,
  netLiability,
  periodLabel = 'Current Fiscal Period',
  className,
}: TaxSummaryCardProps) {
  const formatCurrency = (val: number) => {
    return '$' + Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const isLiability = netLiability >= 0;

  return (
    <Card className={cn('bg-card border-border text-foreground select-none text-left', className)}>
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-sans">
              Tax Summary Desk
            </span>
            <p className="text-xs text-muted-foreground font-mono">{periodLabel}</p>
          </div>
          <BadgePercent className="h-5 w-5 text-indigo-400" />
        </div>

        {/* Main metrics comparison */}
        <div className="grid grid-cols-2 gap-4 divide-x divide-border">
          {/* Sales Tax collected */}
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold font-sans flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-400" />
              <span>Output (Collected)</span>
            </span>
            <p className="text-sm font-bold font-mono text-emerald-400">
              {formatCurrency(salesTax)}
            </p>
            <p className="text-[9px] text-slate-550">Taxes charged on sales receipts</p>
          </div>

          {/* Purchase Tax paid */}
          <div className="space-y-1 pl-4 text-left">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold font-sans flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-rose-455" />
              <span>Input (Paid Offset)</span>
            </span>
            <p className="text-sm font-bold font-mono text-foreground">
              {formatCurrency(purchaseTax)}
            </p>
            <p className="text-[9px] text-slate-550">Taxes paid on vendor bills</p>
          </div>
        </div>

        {/* Liability outcome */}
        <div className="pt-3 border-t border-border flex justify-between items-center">
          <span className="text-xs font-semibold text-muted-foreground">
            {isLiability ? 'Net Tax Liability Due:' : 'Net Tax Refund Claim:'}
          </span>
          <span
            className={cn(
              'text-base font-black font-mono tracking-tight',
              isLiability ? 'text-rose-455' : 'text-emerald-400',
            )}
          >
            {formatCurrency(netLiability)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

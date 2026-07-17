'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ArrowDownLeft, ArrowUpRight, ShieldAlert, CreditCard } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { LedgerTransaction } from '@/types/accounting';

interface TransactionTimelineProps {
  entries: LedgerTransaction[];
  className?: string;
  loading?: boolean;
}

export function TransactionTimeline({
  entries,
  className,
  loading = false,
}: TransactionTimelineProps) {
  const formatCurrency = (val: number) => {
    return '$' + Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'INCOME':
        return (
          <div className="h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ArrowDownLeft className="h-3.5 w-3.5" />
          </div>
        );
      case 'EXPENSE':
        return (
          <div className="h-7 w-7 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-455">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        );
      case 'VOUCHER':
        return (
          <div className="h-7 w-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <CreditCard className="h-3.5 w-3.5" />
          </div>
        );
      case 'JOURNAL':
      default:
        return (
          <div className="h-7 w-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FileText className="h-3.5 w-3.5" />
          </div>
        );
    }
  };

  return (
    <Card className={cn('bg-cardard border-border text-foreground text-left', className)}>
      <CardContent className="p-4 space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
          Transaction Timeline
        </h4>

        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-6 animate-pulse">
            Fetching timeline events...
          </p>
        ) : entries.length > 0 ? (
          <div className="relative pl-4 space-y-5 border-l border-border pt-2 pb-1 font-mono text-[11px] sm:text-xs">
            {entries.map((entry, idx) => {
              const hasDebit = entry.debitAmount > 0;
              const valueLabel = hasDebit
                ? `+${formatCurrency(entry.debitAmount)}`
                : `-${formatCurrency(entry.creditAmount)}`;

              return (
                <div key={entry.id || idx} className="relative flex items-start gap-3 group">
                  {/* Anchor timeline dot */}
                  <div className="absolute -left-[30px] top-1.5 bg-cardard px-0.5">
                    {getTimelineIcon(entry.transactionType)}
                  </div>

                  {/* Body details */}
                  <div className="flex-1 min-w-0 space-y-0.5 text-left">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-bold text-foreground truncate pr-2">{entry.description}</p>
                      <span
                        className={cn(
                          'font-bold shrink-0 text-right font-mono text-xs',
                          hasDebit ? 'text-emerald-400' : 'text-rose-455',
                        )}
                      >
                        {valueLabel}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <div>
                        <span>Ref: {entry.referenceNumber}</span>
                        <span className="mx-1.5">•</span>
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span>Bal: {formatCurrency(entry.runningBalance)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-border rounded-xl">
            <ShieldAlert className="h-5 w-5 text-slate-600 mx-auto mb-1.5" />
            <p className="text-[11px] text-muted-foreground">No timeline entries found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { ShoppingCart, CreditCard, RotateCcw, SlidersHorizontal, PlusCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/utils/cn';
import type { CustomerLedgerEntry, CustomerLedgerEntryType } from '@/types/customer';

interface TransactionTimelineProps {
  entries: CustomerLedgerEntry[];
  className?: string;
}

const entryConfig: Record<
  CustomerLedgerEntryType,
  {
    label: string;
    icon: React.ReactNode;
    iconBg: string;
    amountClass: string;
    sign: '+' | '-' | '';
  }
> = {
  SALE: {
    label: 'Sale',
    icon: <ShoppingCart className="w-3.5 h-3.5" />,
    iconBg: 'bg-blue-500/10 text-blue-500',
    amountClass: 'text-blue-600',
    sign: '+',
  },
  PAYMENT: {
    label: 'Payment Received',
    icon: <CreditCard className="w-3.5 h-3.5" />,
    iconBg: 'bg-success/10 text-success',
    amountClass: 'text-success',
    sign: '-',
  },
  RETURN: {
    label: 'Return',
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    iconBg: 'bg-warning/10 text-warning',
    amountClass: 'text-warning',
    sign: '-',
  },
  ADJUSTMENT: {
    label: 'Adjustment',
    icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
    iconBg: 'bg-muted text-muted-foreground',
    amountClass: 'text-foreground',
    sign: '',
  },
  OPENING_BALANCE: {
    label: 'Opening Balance',
    icon: <PlusCircle className="w-3.5 h-3.5" />,
    iconBg: 'bg-violet-500/10 text-violet-500',
    amountClass: 'text-violet-600',
    sign: '',
  },
};

function TimelineEntry({ entry }: { entry: CustomerLedgerEntry }) {
  const config = entryConfig[entry.entryType] ?? entryConfig['ADJUSTMENT']!;
  const amount = parseFloat(entry.amount);

  return (
    <div className="flex gap-3 group">
      {/* Icon + line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-border',
            config.iconBg,
          )}
        >
          {config.icon}
        </div>
        <div className="w-px flex-1 bg-border/60 mt-1 group-last:hidden" />
      </div>

      {/* Content */}
      <div className="pb-5 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{config.label}</p>
            {entry.referenceNo && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Ref: {entry.referenceNo}
              </p>
            )}
            {entry.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.description}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className={cn('text-sm font-semibold', config.amountClass)}>
              {config.sign}
              {formatCurrency(amount)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Balance: {formatCurrency(parseFloat(entry.runningBalance))}
            </p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {(() => {
            try {
              const d = parseISO(entry.createdAt);
              return isValid(d) ? format(d, 'dd MMM yyyy, HH:mm') : '—';
            } catch {
              return '—';
            }
          })()}
        </p>
      </div>
    </div>
  );
}

export function TransactionTimeline({ entries, className }: TransactionTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <ShoppingCart className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Transaction history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-0', className)}>
      {entries.map((entry) => (
        <TimelineEntry key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

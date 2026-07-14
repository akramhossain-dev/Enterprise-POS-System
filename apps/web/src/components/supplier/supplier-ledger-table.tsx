'use client';

import { ShoppingBag, CreditCard, RotateCcw } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/utils/cn';
import type { SupplierLedgerEntry, SupplierLedgerEntryType } from '@/types/supplier';

interface SupplierLedgerTableProps {
  entries: SupplierLedgerEntry[];
  isLoading?: boolean;
  className?: string;
}

const entryConfig: Record<
  SupplierLedgerEntryType,
  {
    label: string;
    icon: React.ReactNode;
    iconBg: string;
    amountClass: string;
    sign: '+' | '-' | '';
  }
> = {
  PURCHASE: {
    label: 'Purchase',
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
    iconBg: 'bg-blue-500/10 text-blue-500',
    amountClass: 'text-blue-600 dark:text-blue-400',
    sign: '+',
  },
  PAYMENT: {
    label: 'Payment',
    icon: <CreditCard className="w-3.5 h-3.5" />,
    iconBg: 'bg-success/10 text-success',
    amountClass: 'text-success',
    sign: '-',
  },
  PURCHASE_RETURN: {
    label: 'Purchase Return',
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    iconBg: 'bg-warning/10 text-warning',
    amountClass: 'text-warning',
    sign: '-',
  },
};

function LedgerRow({ entry }: { entry: SupplierLedgerEntry }) {
  const config = entryConfig[entry.entryType] ?? entryConfig['PURCHASE']!;
  const amount = parseFloat(entry.amount);
  const date = (() => {
    try {
      const d = parseISO(entry.createdAt);
      return isValid(d) ? format(d, 'dd MMM yyyy') : '—';
    } catch {
      return '—';
    }
  })();

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
              config.iconBg,
            )}
          >
            {config.icon}
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">{config.label}</p>
            {entry.referenceNo && (
              <p className="text-[10px] text-muted-foreground font-mono">{entry.referenceNo}</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-2 text-xs text-muted-foreground">{date}</td>
      <td className="py-3 px-2 text-xs text-muted-foreground max-w-[160px] truncate">
        {entry.description || '—'}
      </td>
      <td className={cn('py-3 px-2 text-xs font-semibold text-right', config.amountClass)}>
        {config.sign}
        {formatCurrency(amount)}
      </td>
      <td className="py-3 pl-2 pr-4 text-xs text-muted-foreground text-right font-mono">
        {formatCurrency(parseFloat(entry.runningBalance))}
      </td>
    </tr>
  );
}

export function SupplierLedgerTable({ entries, isLoading, className }: SupplierLedgerTableProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-2 animate-pulse', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-28 bg-muted rounded" />
              <div className="h-2.5 w-20 bg-muted rounded" />
            </div>
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <ShoppingBag className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No ledger entries yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Entries will appear here as purchases, payments, and returns are recorded.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="py-2.5 pl-4 pr-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Entry
            </th>
            <th className="py-2.5 px-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Date
            </th>
            <th className="py-2.5 px-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Description
            </th>
            <th className="py-2.5 px-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Amount
            </th>
            <th className="py-2.5 pl-2 pr-4 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <LedgerRow key={entry.id} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

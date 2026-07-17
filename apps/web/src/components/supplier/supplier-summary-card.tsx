'use client';

import { TrendingUp, CreditCard, AlertCircle, Wallet } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';

interface SupplierSummaryCardProps {
  totalPurchase?: number;
  totalPaid?: number;
  balance: string;
  creditLimit: string;
  className?: string;
}

function MetricCard({
  label,
  value,
  icon,
  valueClassName,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-muted/40 border border-border/60">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-muted-foreground opacity-60">{icon}</span>
      </div>
      <p className={cn('text-xl font-bold tracking-tight', valueClassName)}>{value}</p>
    </div>
  );
}

export function SupplierSummaryCard({
  totalPurchase,
  totalPaid,
  balance,
  creditLimit,
  className,
}: SupplierSummaryCardProps) {
  const balanceNum = parseFloat(balance);
  const creditLimitNum = parseFloat(creditLimit);
  const usagePercent = creditLimitNum > 0 ? Math.min(100, (balanceNum / creditLimitNum) * 100) : 0;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Total Purchase"
          icon={<TrendingUp className="w-4 h-4" />}
          value={totalPurchase !== undefined ? formatCurrency(totalPurchase) : '—'}
          valueClassName="text-foreground"
        />
        <MetricCard
          label="Total Paid"
          icon={<Wallet className="w-4 h-4" />}
          value={totalPaid !== undefined ? formatCurrency(totalPaid) : '—'}
          valueClassName="text-success"
        />
        <MetricCard
          label="Outstanding Due"
          icon={<AlertCircle className="w-4 h-4" />}
          value={balanceNum > 0 ? formatCurrency(balanceNum) : 'Settled'}
          valueClassName={balanceNum > 0 ? 'text-destructive' : 'text-success'}
        />
        <MetricCard
          label="Credit Limit"
          icon={<CreditCard className="w-4 h-4" />}
          value={formatCurrency(creditLimitNum)}
          valueClassName="text-foreground"
        />
      </div>

      {creditLimitNum > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Credit Utilisation</span>
            <span
              className={cn(
                'font-semibold',
                usagePercent > 80 ? 'text-destructive' : 'text-foreground',
              )}
            >
              {usagePercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                usagePercent > 80
                  ? 'bg-backgroundestructive'
                  : usagePercent > 50
                    ? 'bg-warning'
                    : 'bg-success',
              )}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

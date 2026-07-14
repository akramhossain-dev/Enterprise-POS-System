'use client';

import { Banknote, CreditCard, Smartphone, Building2, HelpCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { format, parseISO, isValid } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import type { SupplierPayment, PaymentMethod } from '@/types/supplier';

interface PaymentHistoryTableProps {
  payments: SupplierPayment[];
  isLoading?: boolean;
  className?: string;
}

const methodConfig: Record<PaymentMethod, { label: string; icon: React.ReactNode; color: string }> =
  {
    CASH: {
      label: 'Cash',
      icon: <Banknote className="w-3.5 h-3.5" />,
      color: 'text-success',
    },
    BANK: {
      label: 'Bank Transfer',
      icon: <Building2 className="w-3.5 h-3.5" />,
      color: 'text-blue-500',
    },
    CARD: {
      label: 'Card',
      icon: <CreditCard className="w-3.5 h-3.5" />,
      color: 'text-violet-500',
    },
    MOBILE_BANKING: {
      label: 'Mobile Banking',
      icon: <Smartphone className="w-3.5 h-3.5" />,
      color: 'text-orange-500',
    },
    OTHER: {
      label: 'Other',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      color: 'text-muted-foreground',
    },
  };

function PaymentRow({ payment }: { payment: SupplierPayment }) {
  const method = methodConfig[payment.paymentMethod] ?? methodConfig['OTHER']!;
  const date = (() => {
    try {
      const d = parseISO(payment.paymentDate ?? payment.createdAt);
      return isValid(d) ? format(d, 'dd MMM yyyy') : '—';
    } catch {
      return '—';
    }
  })();

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-2">
          <span className={cn('flex-shrink-0', method.color)}>{method.icon}</span>
          <span className="text-xs font-medium text-foreground">{method.label}</span>
        </div>
      </td>
      <td className="py-3 px-2 text-xs font-mono text-muted-foreground">{payment.paymentNumber}</td>
      <td className="py-3 px-2 text-xs text-muted-foreground">{payment.reference || '—'}</td>
      <td className="py-3 px-2 text-xs text-muted-foreground">{date}</td>
      <td className="py-3 pl-2 pr-4">
        <Badge variant="outline-success" className="text-xs">
          Paid
        </Badge>
      </td>
      <td className="py-3 pl-2 pr-4 text-xs font-semibold text-success text-right">
        {formatCurrency(parseFloat(payment.amount))}
      </td>
    </tr>
  );
}

export function PaymentHistoryTable({ payments, isLoading, className }: PaymentHistoryTableProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-2 animate-pulse', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-3 w-28 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <Banknote className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No payments recorded</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Payments made to this supplier will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {['Method', 'Payment #', 'Reference', 'Date', 'Status', 'Amount'].map((h) => (
              <th
                key={h}
                className="py-2.5 px-2 first:pl-4 last:pr-4 text-left last:text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <PaymentRow key={p.id} payment={p} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

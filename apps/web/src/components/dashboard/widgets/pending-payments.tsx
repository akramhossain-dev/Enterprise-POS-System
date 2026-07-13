'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CreditCard, Clock, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';

type PaymentStatus = 'overdue' | 'due_soon' | 'upcoming';

interface Payment {
  id: string;
  invoiceNo: string;
  customer: string;
  amount: string;
  dueDate: string;
  status: PaymentStatus;
}

const STATUS_STYLE: Record<PaymentStatus, { label: string; cls: string }> = {
  overdue: { label: 'Overdue', cls: 'bg-red-500/10 text-red-500' },
  due_soon: { label: 'Due Soon', cls: 'bg-amber-500/10 text-amber-500' },
  upcoming: { label: 'Upcoming', cls: 'bg-blue-500/10 text-blue-500' },
};

const DEMO: Payment[] = [
  {
    id: '1',
    invoiceNo: 'INV-2198',
    customer: 'Tech Corp',
    amount: '$1,200.00',
    dueDate: 'Jul 10',
    status: 'overdue',
  },
  {
    id: '2',
    invoiceNo: 'INV-2197',
    customer: 'Retail Hub',
    amount: '$850.00',
    dueDate: 'Jul 14',
    status: 'due_soon',
  },
  {
    id: '3',
    invoiceNo: 'INV-2196',
    customer: 'Global Traders',
    amount: '$2,400.00',
    dueDate: 'Jul 20',
    status: 'upcoming',
  },
  {
    id: '4',
    invoiceNo: 'INV-2195',
    customer: 'Swift Supplies',
    amount: '$630.00',
    dueDate: 'Jul 25',
    status: 'upcoming',
  },
];

export function PendingPayments({ loading = false }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" className="w-1/2" />
              <Skeleton variant="text" className="w-1/3 h-3" />
            </div>
            <Skeleton variant="text" className="w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {DEMO.map((p, i) => {
        const st = STATUS_STYLE[p.status];
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/40 transition-colors"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                st.cls,
              )}
            >
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{p.customer}</p>
              <p className="text-[11px] text-muted-foreground">{p.invoiceNo}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-foreground tabular-nums">{p.amount}</p>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                <span className={cn('text-[10px] font-medium', st.cls.split(' ').pop())}>
                  {p.dueDate}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
      <div className="pt-2 border-t border-border">
        <Link
          href="/accounting"
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          View all invoices
        </Link>
      </div>
    </div>
  );
}

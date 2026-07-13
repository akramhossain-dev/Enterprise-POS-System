'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/utils/cn';

type SaleStatus = 'completed' | 'pending' | 'refunded';

interface Sale {
  id: string;
  orderId: string;
  customer: string;
  amount: string;
  status: SaleStatus;
  time: string;
  avatar?: string;
}

const STATUS_STYLE: Record<SaleStatus, string> = {
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending: 'bg-amber-500/10  text-amber-600  dark:text-amber-400',
  refunded: 'bg-red-500/10    text-red-600    dark:text-red-400',
};

const DEMO_SALES: Sale[] = [
  {
    id: '1',
    orderId: '#1042',
    customer: 'John Smith',
    amount: '$284.00',
    status: 'completed',
    time: '5m ago',
  },
  {
    id: '2',
    orderId: '#1041',
    customer: 'Sarah Johnson',
    amount: '$142.50',
    status: 'completed',
    time: '22m ago',
  },
  {
    id: '3',
    orderId: '#1040',
    customer: 'Michael Brown',
    amount: '$89.99',
    status: 'pending',
    time: '1h ago',
  },
  {
    id: '4',
    orderId: '#1039',
    customer: 'Emily Davis',
    amount: '$412.00',
    status: 'completed',
    time: '2h ago',
  },
  {
    id: '5',
    orderId: '#1038',
    customer: 'Walk-in',
    amount: '$55.00',
    status: 'refunded',
    time: '3h ago',
  },
];

export function RecentSales({ loading = false }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="circular" className="w-8 h-8" />
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" className="w-1/2" />
              <Skeleton variant="text" className="w-1/4 h-3" />
            </div>
            <Skeleton variant="text" className="w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {DEMO_SALES.map((sale, i) => (
        <motion.div
          key={sale.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/40 transition-colors"
        >
          {/* Avatar placeholder */}
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary">
              {sale.customer
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{sale.customer}</p>
            <p className="text-[11px] text-muted-foreground">
              {sale.orderId} · {sale.time}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-foreground tabular-nums">{sale.amount}</p>
            <span
              className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                STATUS_STYLE[sale.status],
              )}
            >
              {sale.status}
            </span>
          </div>
        </motion.div>
      ))}

      <div className="pt-2 border-t border-border">
        <Link
          href="/sales"
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          View all sales
        </Link>
      </div>
    </div>
  );
}

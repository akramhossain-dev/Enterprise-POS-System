'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Customer {
  id: string;
  name: string;
  email: string;
  joined: string;
  totalSpent: string;
  initials: string;
  color: string;
}

const DEMO_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    joined: 'Jul 10',
    totalSpent: '$1,820',
    initials: 'JS',
    color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    joined: 'Jul 9',
    totalSpent: '$940',
    initials: 'SJ',
    color: 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'mike@example.com',
    joined: 'Jul 8',
    totalSpent: '$2,310',
    initials: 'MB',
    color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    joined: 'Jul 7',
    totalSpent: '$680',
    initials: 'ED',
    color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  },
  {
    id: '5',
    name: 'James Wilson',
    email: 'james@example.com',
    joined: 'Jul 6',
    totalSpent: '$1,450',
    initials: 'JW',
    color: 'bg-red-500/20 text-red-600 dark:text-red-400',
  },
];

export function RecentCustomers({ loading = false }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="circular" className="w-8 h-8" />
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" className="w-1/2" />
              <Skeleton variant="text" className="w-2/3 h-3" />
            </div>
            <Skeleton variant="text" className="w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {DEMO_CUSTOMERS.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/40 transition-colors"
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-xs ${c.color}`}
          >
            {c.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{c.email}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-foreground tabular-nums">{c.totalSpent}</p>
            <p className="text-[10px] text-muted-foreground">since {c.joined}</p>
          </div>
        </motion.div>
      ))}

      <div className="pt-2 border-t border-border">
        <Link
          href="/customers"
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          View all customers
        </Link>
      </div>
    </div>
  );
}

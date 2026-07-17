'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Package,
  User,
  CreditCard,
  AlertTriangle,
  Info,
  Activity,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatRelative } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityItem {
  id: string;
  type: 'sale' | 'stock' | 'customer' | 'payment' | 'alert' | 'info';
  title: string;
  description?: string;
  timestamp: string;
}

const ICON_MAP = {
  sale: { icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
  stock: { icon: Package, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  customer: { icon: User, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  payment: { icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  alert: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

const DEMO_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    type: 'sale',
    title: 'New sale — Order #1042',
    description: '$284.00 — John Smith',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'customer',
    title: 'New customer registered',
    description: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'stock',
    title: 'Low stock alert',
    description: 'iPhone 15 Pro — 3 left',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment received',
    description: 'Invoice #2198 — $1,200',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'sale',
    title: 'New sale — Order #1041',
    description: '$142.50 — Walk-in',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'info',
    title: 'End of day report generated',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];

export function RecentActivity({ loading = false }: { loading?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton variant="text" className="w-3/4" />
              <Skeleton variant="text" className="w-1/2 h-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (DEMO_ACTIVITY.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <Activity className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-border" aria-hidden="true" />
      <ul className="space-y-1">
        <AnimatePresence>
          {DEMO_ACTIVITY.map((item, i) => {
            const cfg = ICON_MAP[item.type];
            const Icon = cfg.icon;
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 pl-1"
              >
                <div
                  className={cn(
                    'relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-background',
                    cfg.bg,
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                </div>
                <div className="flex-1 min-w-0 pb-4">
                  <p className="text-sm font-medium text-foreground leading-snug">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    {formatRelative(item.timestamp)}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Package,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Store,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

interface Shortcut {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const SHORTCUTS: Shortcut[] = [
  {
    id: 'pos',
    label: 'POS',
    href: '/pos',
    icon: Store,
    color: 'text-primary',
    bg: 'bg-primary/10 hover:bg-primary/20',
  },
  {
    id: 'sales',
    label: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    href: '/inventory',
    icon: Package,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10 hover:bg-violet-500/20',
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/customers',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 hover:bg-blue-500/20',
  },
  {
    id: 'invoices',
    label: 'Invoices',
    href: '/accounting',
    icon: FileText,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
  },
  {
    id: 'payments',
    label: 'Payments',
    href: '/accounting',
    icon: CreditCard,
    color: 'text-red-500',
    bg: 'bg-red-500/10 hover:bg-red-500/20',
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    color: 'text-muted-foreground',
    bg: 'bg-muted hover:bg-muted/80',
  },
];

export function QuickShortcuts() {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
      {SHORTCUTS.map((shortcut, i) => {
        const Icon = shortcut.icon;
        return (
          <motion.div
            key={shortcut.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={shortcut.href}
              id={`shortcut-${shortcut.id}`}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                shortcut.bg,
              )}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-background/60">
                <Icon className={cn('w-5 h-5', shortcut.color)} aria-hidden="true" />
              </div>
              <span className="text-[11px] font-medium text-foreground/80 text-center leading-tight">
                {shortcut.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

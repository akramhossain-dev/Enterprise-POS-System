'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Package, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';

interface StockItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  threshold: number;
  category: string;
}

const DEMO_ITEMS: StockItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro 256GB',
    sku: 'IPH15P-256',
    stock: 3,
    threshold: 10,
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24',
    sku: 'SAM-S24',
    stock: 2,
    threshold: 5,
    category: 'Electronics',
  },
  {
    id: '3',
    name: 'AirPods Pro 2nd Gen',
    sku: 'APP-2GEN',
    stock: 5,
    threshold: 10,
    category: 'Audio',
  },
  {
    id: '4',
    name: 'USB-C Hub 7-in-1',
    sku: 'USBC-7IN1',
    stock: 1,
    threshold: 8,
    category: 'Accessories',
  },
  {
    id: '5',
    name: 'Screen Protector Pack',
    sku: 'SCR-PACK',
    stock: 7,
    threshold: 20,
    category: 'Accessories',
  },
];

function StockBar({ stock, threshold }: { stock: number; threshold: number }) {
  const pct = Math.min((stock / threshold) * 100, 100);
  return (
    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          pct <= 30 ? 'bg-red-500' : pct <= 60 ? 'bg-amber-500' : 'bg-emerald-500',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function LowStockAlert({ loading = false }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" className="w-2/3" />
              <Skeleton variant="text" className="w-1/3 h-3" />
            </div>
            <Skeleton variant="text" className="w-10" />
          </div>
        ))}
      </div>
    );
  }

  if (DEMO_ITEMS.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <Package className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">All items well stocked</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {DEMO_ITEMS.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/40 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {item.sku} · {item.category}
            </p>
          </div>
          <div className="text-right flex-shrink-0 space-y-1">
            <p className="text-sm font-semibold text-red-500 tabular-nums">{item.stock} left</p>
            <StockBar stock={item.stock} threshold={item.threshold} />
          </div>
        </motion.div>
      ))}

      <div className="pt-2 border-t border-border">
        <Link
          href="/inventory"
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Manage inventory
        </Link>
      </div>
    </div>
  );
}

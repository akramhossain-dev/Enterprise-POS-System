'use client';

import type { InventoryLedger, StockMovement } from '@/types/inventory';
import { cn } from '@/utils/cn';
import {
  LucideIcon,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Minus,
  AlertOctagon,
  Calendar,
  Warehouse,
  User,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

interface StockTimelineProps {
  movements: StockMovement[] | InventoryLedger[];
  loading?: boolean;
}

export function StockTimeline({ movements, loading = false }: StockTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-6 relative border-l border-border pl-6 ml-3 py-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="relative animate-pulse">
            <div className="absolute -left-[31px] rounded-full bg-muted w-4 h-4 border-2 border-background" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Extract raw movements if ledger array is passed
  const list: StockMovement[] = movements.map((m) => {
    if ('movement' in m) {
      return m.movement;
    }
    return m;
  });

  if (list.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">No stock activities recorded yet.</p>
      </div>
    );
  }

  const CONFIG: Record<
    string,
    {
      bg: string;
      text: string;
      border: string;
      icon: LucideIcon;
      label: string;
      isPositive: boolean;
    }
  > = {
    OPENING_STOCK: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      icon: Plus,
      label: 'Opening Stock',
      isPositive: true,
    },
    PURCHASE: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      icon: ArrowDownLeft,
      label: 'Purchase Stock-In',
      isPositive: true,
    },
    PURCHASE_RETURN: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
      icon: ArrowUpRight,
      label: 'Purchase Return',
      isPositive: false,
    },
    SALE: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
      icon: ArrowUpRight,
      label: 'Sale Stock-Out',
      isPositive: false,
    },
    SALE_RETURN: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      icon: ArrowDownLeft,
      label: 'Sales Return',
      isPositive: true,
    },
    TRANSFER_IN: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/30',
      icon: Warehouse,
      label: 'Transfer In',
      isPositive: true,
    },
    TRANSFER_OUT: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30',
      icon: Warehouse,
      label: 'Transfer Out',
      isPositive: false,
    },
    ADJUSTMENT_IN: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      icon: Plus,
      label: 'Adjustment (+)',
      isPositive: true,
    },
    ADJUSTMENT_OUT: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
      icon: Minus,
      label: 'Adjustment (-)',
      isPositive: false,
    },
    DAMAGE: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
      icon: AlertOctagon,
      label: 'Damaged Stock',
      isPositive: false,
    },
    EXPIRED: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
      icon: AlertOctagon,
      label: 'Expired Stock',
      isPositive: false,
    },
    LOST: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
      icon: Trash2,
      label: 'Lost Stock',
      isPositive: false,
    },
    MANUAL: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/30',
      icon: RefreshCw,
      label: 'Manual Correction',
      isPositive: true,
    },
  };

  return (
    <div className="relative border-l border-border pl-6 ml-3 py-2 space-y-6">
      {list.map((item) => {
        const typeCfg = CONFIG[item.movementType] || {
          bg: 'bg-muted',
          text: 'text-muted-foreground',
          border: 'border-muted-foreground/30',
          icon: RefreshCw,
          label: item.movementType,
          isPositive: true,
        };

        const Icon = typeCfg.icon;
        const qtyNum = Number(item.quantity);

        return (
          <div key={item.id} className="relative group transition-all duration-300">
            {/* Timeline Dot Icon */}
            <span
              className={cn(
                'absolute -left-[38px] top-0.5 rounded-full p-1.5 border-2 border-background shadow-sm transition-transform duration-300 group-hover:scale-110',
                typeCfg.bg,
                typeCfg.text,
                typeCfg.border,
              )}
              title={typeCfg.label}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>

            {/* Content card */}
            <div className="space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="font-semibold text-sm text-foreground">{typeCfg.label}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Product and warehouse descriptors */}
              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                {item.product?.name && (
                  <span className="font-medium text-foreground">{item.product.name}</span>
                )}
                {item.warehouse?.name && (
                  <span className="flex items-center gap-1">
                    <Warehouse className="w-3 h-3" />
                    {item.warehouse.name}
                  </span>
                )}
              </div>

              {/* Transaction details & comments */}
              <div className="flex items-center justify-between gap-4 mt-1 bg-muted/30 p-2.5 rounded-lg border border-border/50">
                <div className="text-xs">
                  {item.remarks ? (
                    <p className="italic text-muted-foreground">{item.remarks}</p>
                  ) : (
                    <p className="text-muted-foreground/60">No remarks</p>
                  )}
                  {item.referenceType && item.referenceId && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Ref: {item.referenceType} ({item.referenceId.slice(0, 8)})
                    </p>
                  )}
                </div>
                <div className="text-right flex flex-col justify-center">
                  <span
                    className={cn(
                      'text-sm font-bold flex items-center justify-end gap-0.5',
                      typeCfg.isPositive ? 'text-emerald-500' : 'text-rose-500',
                    )}
                  >
                    {typeCfg.isPositive ? '+' : '-'}
                    {qtyNum.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Bal: {Number(item.newQuantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

interface StockStatusBadgeProps {
  status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ALL';
  availableQuantity?: number;
  minimumQuantity?: number;
  className?: string;
}

export function StockStatusBadge({
  status,
  availableQuantity,
  minimumQuantity = 0,
  className,
}: StockStatusBadgeProps) {
  let resolvedStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';

  if (status && status !== 'ALL') {
    resolvedStatus = status as 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  } else if (availableQuantity !== undefined) {
    if (availableQuantity <= 0) {
      resolvedStatus = 'OUT_OF_STOCK';
    } else if (availableQuantity <= minimumQuantity) {
      resolvedStatus = 'LOW_STOCK';
    } else {
      resolvedStatus = 'IN_STOCK';
    }
  }

  const CONFIG = {
    IN_STOCK: {
      label: 'In Stock',
      className: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20',
    },
    LOW_STOCK: {
      label: 'Low Stock',
      className: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20',
    },
    OUT_OF_STOCK: {
      label: 'Out of Stock',
      className: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20',
    },
  };

  const current = CONFIG[resolvedStatus];

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium text-xs rounded-full px-2.5 py-0.5 border shadow-sm transition-all duration-300',
        current.className,
        className,
      )}
    >
      <span className="flex items-center gap-1">
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full animate-pulse',
            resolvedStatus === 'IN_STOCK' && 'bg-emerald-500',
            resolvedStatus === 'LOW_STOCK' && 'bg-amber-500',
            resolvedStatus === 'OUT_OF_STOCK' && 'bg-rose-500',
          )}
        />
        {current.label}
      </span>
    </Badge>
  );
}

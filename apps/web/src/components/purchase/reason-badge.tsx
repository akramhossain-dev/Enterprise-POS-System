'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import type { PurchaseReturnReason } from '@/types/purchase-return';

interface ReasonBadgeProps {
  reason: PurchaseReturnReason | string;
  className?: string;
}

export function ReasonBadge({ reason, className }: ReasonBadgeProps) {
  const normalized = reason.toUpperCase();

  const CONFIG: Record<string, { label: string; className: string }> = {
    DAMAGED: {
      label: 'Damaged Product',
      className: 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/15',
    },
    EXPIRED: {
      label: 'Expired',
      className: 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/15',
    },
    WRONG_PRODUCT: {
      label: 'Wrong Product Sent',
      className: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/15',
    },
    WRONG_QUANTITY: {
      label: 'Wrong Qty Shipped',
      className: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/15',
    },
    QUALITY_ISSUE: {
      label: 'Quality Defect',
      className: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/15',
    },
    PACKAGING_DAMAGE: {
      label: 'Packaging Damaged',
      className: 'bg-amber-600/10 text-amber-600 border-amber-600/20 hover:bg-amber-600/15',
    },
    SUPPLIER_ERROR: {
      label: 'Supplier Discrepancy',
      className: 'bg-violet-500/10 text-violet-500 border-violet-500/20 hover:bg-violet-500/15',
    },
    MANUAL_CORRECTION: {
      label: 'Manual Correction',
      className: 'bg-slate-500/10 text-muted-foreground border-slate-500/20 hover:bg-slate-500/15',
    },
    OTHER: {
      label: 'Other Reasons',
      className: 'bg-muted text-muted-foreground border-muted/30 hover:bg-muted/25',
    },
  };

  const current = CONFIG[normalized] || {
    label: reason,
    className: 'bg-muted text-muted-foreground border-muted/30',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium text-xs rounded-full px-2 py-0.5 border transition-all duration-300',
        current.className,
        className,
      )}
    >
      {current.label}
    </Badge>
  );
}

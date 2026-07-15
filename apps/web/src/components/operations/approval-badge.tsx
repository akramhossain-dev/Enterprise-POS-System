'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

interface ApprovalBadgeProps {
  status: string;
  className?: string;
}

export function ApprovalBadge({ status, className }: ApprovalBadgeProps) {
  const normalized = status.toUpperCase();

  const CONFIG: Record<string, { label: string; className: string }> = {
    DRAFT: {
      label: 'Draft',
      className: 'bg-muted text-muted-foreground border-muted/30 hover:bg-muted/25',
    },
    PENDING: {
      label: 'Pending Approval',
      className: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/15',
    },
    APPROVED: {
      label: 'Approved',
      className: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/15',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      className:
        'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/15 animate-pulse',
    },
    REJECTED: {
      label: 'Rejected',
      className: 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/15',
    },
    COMPLETED: {
      label: 'Completed',
      className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15',
    },
    CANCELLED: {
      label: 'Cancelled',
      className:
        'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20 hover:bg-muted-foreground/15',
    },
    IN_TRANSIT: {
      label: 'In Transit',
      className: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/15',
    },
  };

  const current = CONFIG[normalized] || {
    label: status,
    className: 'bg-muted text-muted-foreground border-muted/30',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold text-xs rounded-full px-2.5 py-0.5 border shadow-sm transition-all duration-300',
        current.className,
        className,
      )}
    >
      {current.label}
    </Badge>
  );
}

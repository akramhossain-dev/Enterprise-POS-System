import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import type { SupplierStatus } from '@/types/supplier';

interface SupplierStatusBadgeProps {
  status: SupplierStatus;
  className?: string;
}

const statusConfig: Record<
  SupplierStatus,
  { label: string; variant: 'outline-success' | 'outline-warning' | 'secondary' }
> = {
  ACTIVE: { label: 'Active', variant: 'outline-success' },
  INACTIVE: { label: 'Inactive', variant: 'outline-warning' },
  ARCHIVED: { label: 'Archived', variant: 'secondary' },
};

export function SupplierStatusBadge({ status, className }: SupplierStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: 'secondary' as const };
  return (
    <Badge variant={config.variant} dot className={cn(className)}>
      {config.label}
    </Badge>
  );
}

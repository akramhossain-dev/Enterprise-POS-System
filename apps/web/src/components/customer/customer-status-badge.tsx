import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import type { CustomerStatus } from '@/types/customer';

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

const statusConfig: Record<
  CustomerStatus,
  { label: string; variant: 'outline-success' | 'outline-warning' | 'secondary' }
> = {
  ACTIVE: { label: 'Active', variant: 'outline-success' },
  INACTIVE: { label: 'Inactive', variant: 'outline-warning' },
  ARCHIVED: { label: 'Archived', variant: 'secondary' },
};

export function CustomerStatusBadge({ status, className }: CustomerStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: 'secondary' as const };
  return (
    <Badge variant={config.variant} dot className={cn(className)}>
      {config.label}
    </Badge>
  );
}

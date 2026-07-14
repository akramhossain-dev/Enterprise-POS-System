import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';

interface SupplierDueBadgeProps {
  /** currentBalance as string from API (positive = we owe supplier money) */
  balance: string;
  className?: string;
}

export function SupplierDueBadge({ balance, className }: SupplierDueBadgeProps) {
  const amount = parseFloat(balance);

  if (isNaN(amount) || amount <= 0) {
    return (
      <Badge variant="outline-success" className={cn(className)}>
        Settled
      </Badge>
    );
  }

  const variant = amount > 50000 ? 'outline-destructive' : 'outline-warning';

  return (
    <Badge variant={variant} className={cn(className)}>
      Due {formatCurrency(amount)}
    </Badge>
  );
}

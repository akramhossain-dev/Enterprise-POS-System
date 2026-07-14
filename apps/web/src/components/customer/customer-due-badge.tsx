import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';

interface CustomerDueBadgeProps {
  /** currentBalance as string from API (positive = customer owes money) */
  balance: string;
  className?: string;
}

export function CustomerDueBadge({ balance, className }: CustomerDueBadgeProps) {
  const amount = parseFloat(balance);

  if (isNaN(amount) || amount <= 0) {
    return (
      <Badge variant="outline-success" className={cn(className)}>
        No Due
      </Badge>
    );
  }

  const variant = amount > 10000 ? 'outline-destructive' : 'outline-warning';

  return (
    <Badge variant={variant} className={cn(className)}>
      {formatCurrency(amount)}
    </Badge>
  );
}

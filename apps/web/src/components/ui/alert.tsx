import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const alertVariants = cva('relative flex w-full gap-3 rounded-lg border p-4 text-sm', {
  variants: {
    variant: {
      default: 'bg-background border-border text-foreground',
      info: 'bg-info/10 border-info/30 text-info-foreground [&>svg]:text-info',
      success: 'bg-success/10 border-success/30 text-success-foreground [&>svg]:text-success',
      warning: 'bg-warning/10 border-warning/30 text-warning-foreground [&>svg]:text-warning',
      destructive:
        'bg-destructive/10 border-destructive/30 text-destructive-foreground [&>svg]:text-destructive',
    },
  },
  defaultVariants: { variant: 'default' },
});

const variantIcons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
};

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

function Alert({
  className,
  variant = 'default',
  title,
  description,
  dismissible,
  onDismiss,
  icon,
  children,
  ...props
}: AlertProps) {
  const Icon = variantIcons[variant ?? 'default'];

  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <span className="flex-shrink-0 mt-0.5" aria-hidden="true">
        {icon ?? <Icon className="h-4 w-4" />}
      </span>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold leading-none mb-1">{title}</p>}
        {description && <p className="text-sm leading-relaxed opacity-90">{description}</p>}
        {children}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('font-semibold leading-none', className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm opacity-90', className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };

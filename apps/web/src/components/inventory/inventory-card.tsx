'use client';

import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface InventoryCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export function InventoryCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = 'default',
}: InventoryCardProps) {
  const variantClasses = {
    default: 'hover:border-border/80 border-border',
    primary: 'border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30',
    success:
      'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30',
    warning: 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/30',
    danger: 'border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/30',
    info: 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30',
  };

  const iconColorClasses = {
    default: 'text-muted-foreground bg-muted',
    primary: 'text-primary bg-primary/10',
    success: 'text-emerald-500 bg-emerald-500/10',
    warning: 'text-amber-500 bg-amber-500/10',
    danger: 'text-rose-500 bg-rose-500/10',
    info: 'text-blue-500 bg-blue-500/10',
  };

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 hover:shadow-md group',
        variantClasses[variant],
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">
              {title}
            </p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
          </div>
          <div
            className={cn(
              'p-3 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm',
              iconColorClasses[variant],
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {(description || trend) && (
          <div className="flex items-center gap-2 mt-4 text-xs">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded-md',
                  trend.isPositive
                    ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400'
                    : 'text-rose-600 bg-rose-500/10 dark:text-rose-400',
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trend.value}%
              </span>
            )}
            {description && <span className="text-muted-foreground truncate">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

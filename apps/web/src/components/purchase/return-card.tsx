'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface ReturnCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

export function ReturnCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  variant = 'default',
}: ReturnCardProps) {
  const variantStyles = {
    default: 'border-border bg-card text-card-foreground',
    primary: 'border-blue-500/20 bg-blue-500/5 text-blue-500',
    success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500',
    warning: 'border-amber-500/20 bg-amber-500/5 text-amber-500',
    danger: 'border-rose-500/20 bg-rose-500/5 text-rose-500',
    info: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-500',
    purple: 'border-violet-500/20 bg-violet-500/5 text-violet-500',
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card
        className={cn(
          'overflow-hidden border shadow-sm rounded-xl',
          variantStyles[variant],
          className,
        )}
      >
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              {title}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground tracking-tight">{value}</span>
            </div>
            {description && <p className="text-[10px] text-muted-foreground/80">{description}</p>}
          </div>

          <div
            className={cn(
              'p-3 rounded-lg border shadow-sm shrink-0',
              variant === 'default'
                ? 'bg-muted/50 border-border'
                : 'bg-background border-current/15',
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

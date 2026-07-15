'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface GrnCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export function GrnCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  variant = 'default',
}: GrnCardProps) {
  const variantStyles = {
    default: 'border-border bg-card text-card-foreground',
    primary: 'border-primary/20 bg-primary/5 text-primary',
    success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500',
    warning: 'border-amber-500/20 bg-amber-500/5 text-amber-500',
    danger: 'border-rose-500/20 bg-rose-500/5 text-rose-500',
    info: 'border-blue-500/20 bg-blue-500/5 text-blue-500',
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="w-full text-sm"
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
                : 'bg-background border-current/10',
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

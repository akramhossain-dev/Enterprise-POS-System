'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';

export type KpiTrend = 'up' | 'down' | 'neutral';

export interface KpiCardProps {
  title: string;
  value: string | number;
  growth?: number; // positive = up, negative = down
  trend?: KpiTrend;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  prefix?: string; // e.g. "$"
  suffix?: string; // e.g. "%"
  description?: string; // secondary label
  href?: string;
  loading?: boolean;
  animate?: boolean; // counter animation
  className?: string;
}

function AnimatedValue({
  value,
  prefix = '',
  suffix = '',
}: {
  value: string | number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayed, setDisplayed] = useState<string | number>(
    typeof value === 'number' ? 0 : value,
  );

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayed(value);
      return;
    }
    const start = 0;
    const end = value;
    const duration = 900;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayed}
      {suffix}
    </span>
  );
}

const TREND_CONFIG = {
  up: { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  down: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/10' },
  neutral: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted' },
};

export function KpiCard({
  title,
  value,
  growth,
  trend = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  prefix,
  suffix,
  description,
  href,
  loading = false,
  animate = true,
  className,
}: KpiCardProps) {
  if (loading) {
    return (
      <div className={cn('rounded-xl border border-border bg-cardard p-5 space-y-3', className)}>
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-24 h-3" />
          <Skeleton variant="circular" className="w-9 h-9" />
        </div>
        <Skeleton variant="text" className="w-32 h-7" />
        <Skeleton variant="text" className="w-20 h-3" />
      </div>
    );
  }

  const trendConfig = TREND_CONFIG[trend];
  const TrendIcon = trendConfig.icon;

  const CardInner = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border border-border bg-cardard p-5 shadow-sm',
        'transition-all duration-200',
        href && 'hover:shadow-md hover:border-border/80 hover:-translate-y-0.5 cursor-pointer',
        className,
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('p-2 rounded-lg flex-shrink-0', iconBg)}>
          <Icon className={cn('w-4 h-4', iconColor)} aria-hidden="true" />
        </div>
      </div>

      {/* Value */}
      <div className="text-2xl font-bold text-foreground tabular-nums">
        {animate && typeof value === 'number' ? (
          <AnimatedValue value={value} prefix={prefix} suffix={suffix} />
        ) : (
          <span>
            {prefix}
            {value}
            {suffix}
          </span>
        )}
      </div>

      {/* Growth / description */}
      <div className="flex items-center gap-2 mt-2">
        {growth !== undefined && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full',
              trendConfig.color,
              trendConfig.bg,
            )}
          >
            <TrendIcon className="w-3 h-3" aria-hidden="true" />
            {growth > 0 ? '+' : ''}
            {growth}%
          </span>
        )}
        {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
      </div>
    </motion.div>
  );

  if (href)
    return (
      <Link href={href} className="block">
        {CardInner}
      </Link>
    );
  return CardInner;
}

'use client';

import { CheckCircle2, MailCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/utils/cn';

type VerificationStatus = 'pending' | 'success' | 'error';

interface VerificationCardProps {
  status: VerificationStatus;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

const STATUS_CONFIG = {
  pending: {
    icon: MailCheck,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    defaultTitle: 'Check your email',
    defaultDescription: 'We sent a verification link to your email address.',
  },
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    defaultTitle: 'Email verified!',
    defaultDescription: 'Your email address has been verified successfully.',
  },
  error: {
    icon: AlertCircle,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    defaultTitle: 'Verification failed',
    defaultDescription: 'The verification link is invalid or has expired.',
  },
};

export function VerificationCard({
  status,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: VerificationCardProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('text-center space-y-5', className)}
    >
      <div
        className={cn(
          'mx-auto w-16 h-16 rounded-full flex items-center justify-center',
          config.iconBg,
        )}
      >
        <Icon className={cn('w-8 h-8', config.iconColor)} />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">{title ?? config.defaultTitle}</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {description ?? config.defaultDescription}
        </p>
      </div>

      {(actionHref ?? onAction) &&
        actionLabel &&
        (actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center px-4 py-2 rounded-[--radius-md] bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center px-4 py-2 rounded-[--radius-md] bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {actionLabel}
          </button>
        ))}
    </motion.div>
  );
}

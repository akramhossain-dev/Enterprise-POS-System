'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { CustomerAvatar } from './customer-avatar';
import { CustomerStatusBadge } from './customer-status-badge';
import { CustomerDueBadge } from './customer-due-badge';
import { formatCurrency } from '@/utils/format';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/utils/cn';
import type { Customer } from '@/types/customer';

interface CustomerCardProps {
  customer: Customer;
  className?: string;
  onClick?: () => void;
}

export function CustomerCard({ customer, className, onClick }: CustomerCardProps) {
  const defaultAddress = customer.addresses?.find((a) => a.isDefault) ?? customer.addresses?.[0];
  const addressSummary = defaultAddress
    ? [defaultAddress.city, defaultAddress.country].filter(Boolean).join(', ')
    : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200',
        'hover:border-primary/30 hover:shadow-md hover:shadow-primary/5',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CustomerAvatar customer={customer} size="md" />
          <div className="min-w-0">
            <Link
              href={`/customers/${customer.id}`}
              className="block text-sm font-semibold text-foreground hover:text-primary truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {customer.fullName}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              #{customer.customerCode}
            </p>
          </div>
        </div>
        <CustomerStatusBadge status={customer.status} />
      </div>

      {/* Contact info */}
      <div className="space-y-1.5">
        {customer.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{customer.phone}</span>
          </div>
        )}
        {customer.email && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {addressSummary && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{addressSummary}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <CustomerDueBadge balance={customer.currentBalance} />
        <span className="text-[10px] text-muted-foreground">
          Since{' '}
          {(() => {
            try {
              const d = parseISO(customer.createdAt);
              return isValid(d) ? format(d, 'MMM yyyy') : '—';
            } catch {
              return '—';
            }
          })()}
        </span>
      </div>
    </div>
  );
}

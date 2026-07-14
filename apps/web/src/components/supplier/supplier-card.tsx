'use client';

import Link from 'next/link';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import { SupplierAvatar } from './supplier-avatar';
import { SupplierStatusBadge } from './supplier-status-badge';
import { SupplierDueBadge } from './supplier-due-badge';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/utils/cn';
import type { Supplier } from '@/types/supplier';

interface SupplierCardProps {
  supplier: Supplier;
  className?: string;
  onClick?: () => void;
}

export function SupplierCard({ supplier, className, onClick }: SupplierCardProps) {
  const defaultAddress = supplier.addresses?.find((a) => a.isDefault) ?? supplier.addresses?.[0];
  const addressSummary = defaultAddress
    ? [defaultAddress.city, defaultAddress.country].filter(Boolean).join(', ')
    : null;

  const memberSince = (() => {
    try {
      const d = parseISO(supplier.createdAt);
      return isValid(d) ? format(d, 'MMM yyyy') : '—';
    } catch {
      return '—';
    }
  })();

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
          <SupplierAvatar supplier={supplier} size="md" />
          <div className="min-w-0">
            <Link
              href={`/suppliers/${supplier.id}`}
              className="block text-sm font-semibold text-foreground hover:text-primary truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {supplier.companyName}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              #{supplier.supplierCode}
            </p>
          </div>
        </div>
        <SupplierStatusBadge status={supplier.status} />
      </div>

      {/* Contact info */}
      <div className="space-y-1.5">
        {supplier.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{supplier.phone}</span>
          </div>
        )}
        {supplier.email && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{supplier.email}</span>
          </div>
        )}
        {supplier.website && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{supplier.website.replace(/^https?:\/\//, '')}</span>
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
        <SupplierDueBadge balance={supplier.currentBalance} />
        <span className="text-[10px] text-muted-foreground">Since {memberSince}</span>
      </div>
    </div>
  );
}

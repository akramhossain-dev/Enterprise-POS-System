'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RoleBadgeProps {
  roleName: string;
  className?: string;
}

export function RoleBadge({ roleName, className }: RoleBadgeProps) {
  const normName = roleName.toUpperCase();

  let colorClasses = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

  if (normName.includes('SUPER') || normName.includes('OWNER')) {
    colorClasses = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  } else if (normName.includes('ADMIN')) {
    colorClasses = 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
  } else if (normName.includes('MANAGER')) {
    colorClasses = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  } else if (normName.includes('CASHIER')) {
    colorClasses = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  } else if (normName.includes('ACCOUNTANT') || normName.includes('FINANCE')) {
    colorClasses = 'bg-cardyan-500/10 text-cyan-500 border-cyan-500/20';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
        colorClasses,
        className,
      )}
    >
      <Shield className="w-2.5 h-2.5 shrink-0" />
      {roleName}
    </span>
  );
}

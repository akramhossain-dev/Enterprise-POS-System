import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/utils/cn';
import type { Supplier } from '@/types/supplier';

interface SupplierAvatarProps {
  supplier: Pick<Supplier, 'companyName'> & { logoUrl?: string | null };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w.charAt(0).toUpperCase()).join('');
}

function getAvatarColor(name: string): string {
  const colors = [
    'from-indigo-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-violet-500 to-purple-600',
    'from-sky-500 to-cyan-600',
    'from-rose-500 to-pink-600',
    'from-fuchsia-500 to-violet-600',
    'from-blue-500 to-indigo-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

export function SupplierAvatar({ supplier, size = 'md', className }: SupplierAvatarProps) {
  const initials = getInitials(supplier.companyName);
  const gradientClass = getAvatarColor(supplier.companyName);

  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-xl',
        sizeClasses[size],
        className,
      )}
    >
      {supplier.logoUrl ? (
        <AvatarPrimitive.Image
          src={supplier.logoUrl}
          alt={supplier.companyName}
          className="aspect-square h-full w-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback
        className={cn(
          'flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br font-bold text-white tracking-wide',
          gradientClass,
        )}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

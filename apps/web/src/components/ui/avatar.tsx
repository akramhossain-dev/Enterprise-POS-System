import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full', {
  variants: {
    size: {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    },
  },
  defaultVariants: { size: 'md' },
});

interface AvatarProps
  extends
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

function Avatar({ className, size, src, alt, fallback, status, ...props }: AvatarProps) {
  const statusColors = {
    online: 'bg-success',
    offline: 'bg-muted-foreground',
    busy: 'bg-destructive',
    away: 'bg-warning',
  };

  return (
    <div className="relative inline-flex">
      <AvatarPrimitive.Root className={cn(avatarVariants({ size }), className)} {...props}>
        <AvatarPrimitive.Image
          src={src}
          alt={alt ?? 'Avatar'}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-primary font-semibold uppercase">
          {fallback ?? alt?.slice(0, 2) ?? '?'}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full border-2 border-background',
            statusColors[status],
            size === 'xs'
              ? 'h-1.5 w-1.5'
              : size === 'sm'
                ? 'h-2 w-2'
                : size === 'lg'
                  ? 'h-3.5 w-3.5'
                  : size === 'xl'
                    ? 'h-4 w-4'
                    : 'h-2.5 w-2.5',
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

export { Avatar };

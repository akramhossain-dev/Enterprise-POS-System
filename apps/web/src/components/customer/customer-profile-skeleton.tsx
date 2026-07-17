'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';

interface CustomerProfileSkeletonProps {
  className?: string;
}

export function CustomerProfileSkeleton({ className }: CustomerProfileSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-border bg-card">
        <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" className="h-6 w-48" />
          <Skeleton variant="text" className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton variant="text" className="h-6 w-16 rounded-full" />
            <Skeleton variant="text" className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton variant="text" className="h-9 w-24 rounded-lg" />
          <Skeleton variant="text" className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <Skeleton variant="text" className="h-3 w-20" />
            <Skeleton variant="text" className="h-7 w-28" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex gap-1 border-b border-border pb-px">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-9 w-24 rounded-t-lg" />
          ))}
        </div>
        {/* Tab content */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5 pt-1">
                <Skeleton variant="text" className="h-3.5 w-40" />
                <Skeleton variant="text" className="h-3 w-24" />
              </div>
              <Skeleton variant="text" className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

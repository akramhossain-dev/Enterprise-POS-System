'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';

interface CustomerFormSkeletonProps {
  className?: string;
}

function FieldSkeleton() {
  return (
    <div className="space-y-1.5">
      <Skeleton variant="text" className="h-3.5 w-24" />
      <Skeleton variant="text" className="h-9 w-full rounded-lg" />
    </div>
  );
}

export function CustomerFormSkeleton({ className }: CustomerFormSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Section 1 */}
      <div className="rounded-xl border border-border bg-cardard p-5 space-y-4">
        <Skeleton variant="text" className="h-4 w-36" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
      </div>
      {/* Section 2 */}
      <div className="rounded-xl border border-border bg-cardard p-5 space-y-4">
        <Skeleton variant="text" className="h-4 w-36" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
      </div>
      {/* Notes */}
      <div className="rounded-xl border border-border bg-cardard p-5 space-y-4">
        <Skeleton variant="text" className="h-4 w-24" />
        <Skeleton variant="text" className="h-24 w-full rounded-lg" />
      </div>
      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Skeleton variant="text" className="h-9 w-24 rounded-lg" />
        <Skeleton variant="text" className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  );
}

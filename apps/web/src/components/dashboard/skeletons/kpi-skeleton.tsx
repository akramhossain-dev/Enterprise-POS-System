import { Skeleton } from '@/components/ui/skeleton';

export function KpiSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-cardard p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-24 h-3" />
        <Skeleton variant="circular" className="w-9 h-9" />
      </div>
      <Skeleton variant="text" className="w-32 h-7" />
      <div className="flex items-center gap-2">
        <Skeleton className="w-14 h-5 rounded-full" />
        <Skeleton variant="text" className="w-24 h-3" />
      </div>
    </div>
  );
}

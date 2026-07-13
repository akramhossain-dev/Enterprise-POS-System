import { Skeleton } from '@/components/ui/skeleton';

interface WidgetSkeletonProps {
  rows?: number;
  className?: string;
}

export function WidgetSkeleton({ rows = 4, className }: WidgetSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton variant="text" className="w-1/2" />
            <Skeleton variant="text" className="w-1/3 h-3" />
          </div>
          <Skeleton variant="text" className="w-16" />
        </div>
      ))}
    </div>
  );
}

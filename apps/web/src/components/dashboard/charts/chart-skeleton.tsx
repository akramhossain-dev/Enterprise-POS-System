import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';

interface ChartSkeletonProps {
  height?: number;
  className?: string;
}

export function ChartSkeleton({ height = 240, className }: ChartSkeletonProps) {
  return (
    <div
      className={cn('w-full rounded-lg overflow-hidden', className)}
      style={{ height }}
      role="status"
      aria-label="Loading chart"
    >
      {/* Y-axis labels */}
      <div className="flex h-full gap-2">
        <div className="flex flex-col justify-between py-2 w-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-2.5 w-full" />
          ))}
        </div>
        {/* Chart area */}
        <div className="flex-1 flex flex-col gap-1.5 pb-6">
          <div className="flex-1 relative">
            {/* Fake wave bars */}
            <div className="absolute inset-0 flex items-end gap-1.5 pb-0">
              {Array.from({ length: 12 }).map((_, i) => {
                const heights = [40, 65, 45, 80, 55, 90, 60, 75, 50, 85, 70, 45];
                return (
                  <div
                    key={i}
                    className="flex-1 bg-muted rounded-t animate-shimmer"
                    style={{ height: `${heights[i]}%` }}
                  />
                );
              })}
            </div>
          </div>
          {/* X-axis */}
          <div className="flex justify-between">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-2.5 w-8" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

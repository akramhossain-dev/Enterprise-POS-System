import { KpiSkeleton } from './kpi-skeleton';
import { WidgetSkeleton } from './widget-skeleton';
import { ChartSkeleton } from '../charts/chart-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="space-y-2">
            <Skeleton variant="text" className="w-16 h-3" />
            <Skeleton variant="text" className="w-48 h-7" />
            <Skeleton variant="text" className="w-32 h-3" />
          </div>
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1 text-center">
                <Skeleton variant="text" className="w-16 h-3" />
                <Skeleton variant="text" className="w-12 h-6 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>

      {/* Chart + Recent Sales */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5 space-y-4">
          <Skeleton variant="text" className="w-32 h-4" />
          <ChartSkeleton height={220} />
        </div>
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <Skeleton variant="text" className="w-28 h-4" />
          <WidgetSkeleton rows={5} />
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <Skeleton variant="text" className="w-28 h-4" />
            <WidgetSkeleton rows={4} />
          </div>
        ))}
      </div>
    </div>
  );
}

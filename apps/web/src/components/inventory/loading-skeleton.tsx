'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function CardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2 w-2/3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-2/3" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ columns = 6, rows = 5 }) {
  return (
    <div className="space-y-4 border border-border rounded-lg p-4 bg-cardard">
      <div className="flex justify-between items-center gap-4">
        <Skeleton className="h-10 w-1/3 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b border-border last:border-0">
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="p-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Middle Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Warehouse distribution */}
        <Card className="md:col-span-2">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-[250px] w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Stock alerts summary */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-1/2" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lower recent activities */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-5 w-1/4" />
          <div className="space-y-6 relative border-l border-border pl-6 ml-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="relative">
                <Skeleton className="absolute -left-[31px] rounded-full h-4 w-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

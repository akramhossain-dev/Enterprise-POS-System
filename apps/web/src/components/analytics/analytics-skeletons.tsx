'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6 text-left select-none">
      {/* Filters header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-accent" />
          <Skeleton className="h-4 w-64 bg-accent" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-32 bg-accent" />
          <Skeleton className="h-9 w-40 bg-accent" />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-cardard p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 bg-accent" />
              <Skeleton className="h-8 w-8 rounded-lg bg-accent" />
            </div>
            <Skeleton className="h-7 w-32 bg-accent" />
            <Skeleton className="h-3 w-20 bg-accent" />
          </div>
        ))}
      </div>

      {/* Secondary grid row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Large Chart Area */}
        <div className="md:col-span-2 rounded-xl border border-border bg-cardard p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <Skeleton className="h-4 w-32 bg-accent" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-12 bg-accent" />
              <Skeleton className="h-6 w-12 bg-accent" />
            </div>
          </div>
          <Skeleton className="h-60 w-full bg-accent rounded-lg" />
        </div>

        {/* Sidebar Rankings */}
        <div className="rounded-xl border border-border bg-cardard p-5 space-y-4">
          <Skeleton className="h-4 w-32 bg-accent border-b border-border pb-3" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full bg-accent" />
                    <Skeleton className="h-4 w-28 bg-accent" />
                  </div>
                  <Skeleton className="h-4 w-12 bg-accent" />
                </div>
                <Skeleton className="h-1.5 w-full bg-accent rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-cardard p-6 space-y-4">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <Skeleton className="h-4 w-36 bg-accent" />
        <Skeleton className="h-6 w-16 bg-accent" />
      </div>
      <Skeleton className="h-52 w-full bg-accent rounded-lg" />
    </div>
  );
}

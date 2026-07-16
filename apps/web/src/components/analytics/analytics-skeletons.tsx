'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6 text-left select-none">
      {/* Filters header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-slate-900" />
          <Skeleton className="h-4 w-64 bg-slate-900" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-32 bg-slate-900" />
          <Skeleton className="h-9 w-40 bg-slate-900" />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-xl border border-slate-800 bg-[#0c1220] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 bg-slate-900" />
              <Skeleton className="h-8 w-8 rounded-lg bg-slate-900" />
            </div>
            <Skeleton className="h-7 w-32 bg-slate-900" />
            <Skeleton className="h-3 w-20 bg-slate-900" />
          </div>
        ))}
      </div>

      {/* Secondary grid row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Large Chart Area */}
        <div className="md:col-span-2 rounded-xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <Skeleton className="h-4 w-32 bg-slate-900" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-12 bg-slate-900" />
              <Skeleton className="h-6 w-12 bg-slate-900" />
            </div>
          </div>
          <Skeleton className="h-60 w-full bg-slate-900 rounded-lg" />
        </div>

        {/* Sidebar Rankings */}
        <div className="rounded-xl border border-slate-800 bg-[#0c1220] p-5 space-y-4">
          <Skeleton className="h-4 w-32 bg-slate-900 border-b border-slate-900 pb-3" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full bg-slate-900" />
                    <Skeleton className="h-4 w-28 bg-slate-900" />
                  </div>
                  <Skeleton className="h-4 w-12 bg-slate-900" />
                </div>
                <Skeleton className="h-1.5 w-full bg-slate-900 rounded-full" />
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
    <div className="rounded-xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-900 pb-3">
        <Skeleton className="h-4 w-36 bg-slate-900" />
        <Skeleton className="h-6 w-16 bg-slate-900" />
      </div>
      <Skeleton className="h-52 w-full bg-slate-900 rounded-lg" />
    </div>
  );
}

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="p-4 bg-slate-950/40 border-b border-slate-900 flex justify-between items-center">
        <Skeleton className="h-4 w-32 bg-slate-800" />
        <Skeleton className="h-7 w-20 bg-slate-800" />
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-855 bg-slate-955/35">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="py-3 px-4">
                  <Skeleton className="h-3 w-16 bg-slate-800" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="hover:bg-slate-900/40">
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="py-3 px-4">
                    <Skeleton className="h-3 w-24 bg-slate-800/60" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LedgerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Balance Summary skeletons */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-[#0c1220] border-slate-800">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3 w-20 bg-slate-800" />
              <Skeleton className="h-6 w-28 bg-slate-800" />
              <Skeleton className="h-2 w-32 bg-slate-850" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main body split */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <TableSkeleton rows={6} cols={5} />
        </div>
        <div className="md:col-span-1">
          <Card className="bg-[#0c1220] border-slate-800">
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-4 w-32 bg-slate-800" />
              <div className="space-y-3 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-slate-800" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-2/3 bg-slate-800" />
                      <Skeleton className="h-2.5 w-1/3 bg-slate-850" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function FormLoading() {
  return (
    <Card className="bg-[#0c1220] border-slate-800 animate-pulse">
      <CardContent className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 bg-slate-800" />
            <Skeleton className="h-9 w-full bg-slate-900" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 bg-slate-800" />
            <Skeleton className="h-9 w-full bg-slate-900" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-24 bg-slate-800" />
          <Skeleton className="h-20 w-full bg-slate-900" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-32 bg-slate-800" />
          <div className="border border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex gap-4">
              <Skeleton className="h-8 w-1/3 bg-slate-855" />
              <Skeleton className="h-8 w-1/4 bg-slate-855" />
              <Skeleton className="h-8 w-1/4 bg-slate-855" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-8 w-1/3 bg-slate-855" />
              <Skeleton className="h-8 w-1/4 bg-slate-855" />
              <Skeleton className="h-8 w-1/4 bg-slate-855" />
            </div>
          </div>
        </div>

        <Skeleton className="h-10 w-full bg-slate-800" />
      </CardContent>
    </Card>
  );
}

export function ButtonLoading() {
  return (
    <div className="flex items-center gap-1.5 justify-center">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
      <span>Processing...</span>
    </div>
  );
}

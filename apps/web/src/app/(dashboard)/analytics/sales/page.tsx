'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSalesAnalyticsStats } from '@/hooks/use-analytics';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ChartCard } from '@/components/analytics/chart-card';
import { LeaderboardCard } from '@/components/analytics/leaderboard-card';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-skeletons';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function SalesAnalyticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: sales, isLoading } = useSalesAnalyticsStats({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  if (isLoading || !sales) {
    return (
      <PageContainer className="max-w-7xl mx-auto py-6">
        <AnalyticsDashboardSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="text-foreground select-none text-left print:bg-white print:text-black">
      <div className="mb-4 print:hidden">
        <Link href="/analytics/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Executive Dashboard</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Sales Distribution Analytics"
        description="Verify product performance categories, brand allocations, and POS checkout payment methods."
      />

      {/* Date filters */}
      <div className="flex items-center gap-1.5 bg-cardard px-3 border border-border rounded-xl text-xs h-9 w-full sm:w-auto my-6 print:hidden max-w-sm">
        <span className="text-muted-foreground">From</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-transparent text-foreground focus:outline-none cursor-pointer h-full"
        />
        <span className="text-muted-foreground">To</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-transparent text-foreground focus:outline-none cursor-pointer h-full"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <div className="bg-cardard border border-border p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <ShoppingBag className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              Total Sales Invoiced
            </p>
            <p className="text-lg font-black font-mono text-emerald-400">
              ${sales.totalSales.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <ChartCard
          title="Sales Category Share"
          data={sales.salesByCategory}
          type="pie"
          height={240}
        />
        <ChartCard title="Sales Brand Share" data={sales.salesByBrand} type="pie" height={240} />
        <ChartCard
          title="Payment Method Share"
          data={sales.salesByPaymentMethod}
          type="pie"
          height={240}
        />
        <LeaderboardCard
          title="Most Returned Items"
          data={sales.mostReturnedProducts}
          valueLabel="Returns"
          metricPrefix="$"
        />
      </div>
    </PageContainer>
  );
}

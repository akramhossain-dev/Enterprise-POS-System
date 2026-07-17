'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCustomerAnalyticsStats } from '@/hooks/use-analytics';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ChartCard } from '@/components/analytics/chart-card';
import { LeaderboardCard } from '@/components/analytics/leaderboard-card';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-skeletons';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';

export default function CustomerAnalyticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: customers, isLoading } = useCustomerAnalyticsStats({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  if (isLoading || !customers) {
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
        title="Customer Analytics Worksheet"
        description="Verify loyalty program registration trends, segmentation groups, and top spending customers."
      />

      {/* Date filters */}
      <div className="flex items-center gap-1.5 bg-card px-3 border border-border rounded-xl text-xs h-9 w-full sm:w-auto my-6 print:hidden max-w-sm">
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

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <Users className="h-6 w-6 text-emerald-450" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              Total Customer Database
            </p>
            <p className="text-lg font-black font-mono text-emerald-400">
              {customers.totalCustomers.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Customer Base Growth"
          data={customers.customerGrowthTrend}
          type="line"
          dataKeys={['value']}
          xKey="date"
          height={240}
        />
        <ChartCard
          title="Customer Segments"
          data={customers.customerSegmentation}
          type="pie"
          height={240}
        />
        <div className="md:col-span-2">
          <LeaderboardCard
            title="Top Spending Customers"
            data={customers.topCustomers}
            metricPrefix="$"
          />
        </div>
      </div>
    </PageContainer>
  );
}

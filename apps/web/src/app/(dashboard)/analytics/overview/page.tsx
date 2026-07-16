'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useExecutiveDashboardStats } from '@/hooks/use-analytics';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ChartCard } from '@/components/analytics/chart-card';
import { StatisticsCard } from '@/components/analytics/statistics-card';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-skeletons';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, FileDown } from 'lucide-react';
import { toast } from 'sonner';

export default function BusinessOverviewPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch Stats
  const { data: kpis, isLoading } = useExecutiveDashboardStats({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  if (isLoading || !kpis) {
    return (
      <PageContainer className="max-w-7xl mx-auto py-6">
        <AnalyticsDashboardSkeleton />
      </PageContainer>
    );
  }

  // Generate trend line data
  const trendData = [
    { date: '2026-07-10', revenue: 12400, purchase: 8400, profit: 4000 },
    { date: '2026-07-11', value: 14500, purchase: 9200, profit: 5300 },
    { date: '2026-07-12', value: 13200, purchase: 10500, profit: 2700 },
    { date: '2026-07-13', value: 18900, purchase: 6800, profit: 12100 },
    { date: '2026-07-14', value: 22400, purchase: 11400, profit: 11000 },
    { date: '2026-07-15', value: 21100, purchase: 9500, profit: 11600 },
    { date: '2026-07-16', value: 24500, purchase: 12100, profit: 12400 },
  ];

  return (
    <PageContainer className="text-slate-100 select-none text-left print:bg-white print:text-black print:p-0">
      {/* Navigation bar */}
      <div className="mb-4 flex justify-between items-center print:hidden">
        <Link href="/analytics/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Executive Dashboard</span>
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => window.print()}
            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Print Sheet</span>
          </Button>
        </div>
      </div>

      <PageHeader
        title="Business Overview Worksheet"
        description="Verify central KPIs, profit summaries, operating costs, and overall corporate metrics."
      />

      {/* Date filters */}
      <div className="flex items-center gap-1.5 bg-[#0c1220] px-3 border border-slate-850 rounded-xl text-xs h-9 w-full sm:w-auto my-6 print:hidden max-w-sm">
        <span className="text-slate-500">From</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-transparent text-slate-200 focus:outline-none cursor-pointer h-full"
        />
        <span className="text-slate-500">To</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-transparent text-slate-200 focus:outline-none cursor-pointer h-full"
        />
      </div>

      {/* Ratios Metrics Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
        <StatisticsCard
          title="Gross Profit Margin"
          value={kpis.grossProfit}
          growth={kpis.grossProfitChange}
          prefix="$"
          progressValue={68}
          progressLabel="68% Gross Margin Target"
          colorClass="text-emerald-450"
        />
        <StatisticsCard
          title="Conversion Ratio"
          value={kpis.conversionRate}
          growth={kpis.conversionRateChange}
          suffix="%"
          progressValue={kpis.conversionRate * 10}
          progressLabel="2.5% Optimal Standard"
        />
        <StatisticsCard
          title="Inventory Turnover"
          value={kpis.inventoryTurnover}
          growth={kpis.inventoryTurnoverChange}
          suffix="x"
          progressValue={kpis.inventoryTurnover * 10}
          progressLabel="Turnover speed ratio"
        />
        <StatisticsCard
          title="Total Purchase Costs"
          value={kpis.purchaseCost}
          growth={kpis.purchaseCostChange}
          isPositiveUp={false}
          prefix="$"
          progressValue={38}
          progressLabel="38% budget threshold"
          colorClass="text-rose-455"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Profit Trend Accumulation"
          data={trendData.map((t) => ({ date: t.date, value: t.profit }))}
          type="line"
          dataKeys={['value']}
          xKey="date"
          height={240}
        />
        <ChartCard
          title="Supply Expenses Trend"
          data={trendData.map((t) => ({ date: t.date, value: t.purchase }))}
          type="bar"
          dataKeys={['value']}
          xKey="date"
          height={240}
        />
      </div>
    </PageContainer>
  );
}

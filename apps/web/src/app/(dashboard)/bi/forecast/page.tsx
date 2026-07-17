'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForecastQuery } from '@/hooks/use-bi';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import dynamic from 'next/dynamic';

const ForecastChart = dynamic(
  () => import('@/components/bi/forecast-chart').then((mod) => mod.ForecastChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse bg-muted/40 rounded-xl border border-border" />
    ),
  },
);
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-skeletons';

export default function ForecastDashboardPage() {
  const [activeTab, setActiveTab] = useState<'sales' | 'purchase' | 'inventory' | 'demand'>(
    'sales',
  );

  const { data = [], isLoading } = useForecastQuery(activeTab);

  if (isLoading) {
    return (
      <PageContainer className="max-w-7xl mx-auto py-6">
        <AnalyticsDashboardSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="text-foreground select-none text-left print:bg-white print:text-black">
      <div className="mb-4 print:hidden">
        <Link href="/bi">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>BI Dashboard</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Forecasting Trend Projections"
        description="Verify forecasted revenue, supply cost limits, safety stock balances, and projected customer demand."
      />

      {/* Recurrence tab choice */}
      <div className="flex border border-border bg-muted/40 p-0.5 rounded-lg text-xs font-bold font-sans tracking-wide mb-6 print:hidden max-w-sm">
        {(
          [
            { id: 'sales', label: 'Sales Forecast' },
            { id: 'purchase', label: 'Purchase Forecast' },
            { id: 'inventory', label: 'Stock Valuation' },
            { id: 'demand', label: 'Demand Forecast' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded transition-all text-center ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Warning/info alert */}
      <div className="p-3 bg-indigo-500/10 border border-indigo-950/20 text-indigo-400 rounded-xl text-xs flex items-center gap-2 mb-6 print:hidden font-sans">
        <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
        <span>
          BI Forecast displays historical solid lines transitioning into projected dashed
          parameters.
        </span>
      </div>

      {/* Projections chart rendering */}
      <div className="grid gap-6">
        <ForecastChart
          title={`${activeTab.toUpperCase()} Forecast Analytics`}
          description="Solid line: actual historical audits | Dashed line: future projected limits."
          data={data}
        />
      </div>
    </PageContainer>
  );
}

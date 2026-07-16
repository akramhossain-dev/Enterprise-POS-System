'use client';

import React from 'react';
import Link from 'next/link';
import { useHeatmapQuery } from '@/hooks/use-bi';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import dynamic from 'next/dynamic';

const DrilldownCard = dynamic(
  () => import('@/components/bi/drilldown-card').then((mod) => mod.DrilldownCard),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse bg-slate-950/40 rounded-xl border border-slate-900" />
    ),
  },
);
const HeatmapCard = dynamic(
  () => import('@/components/bi/heatmap-card').then((mod) => mod.HeatmapCard),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse bg-slate-950/40 rounded-xl border border-slate-900" />
    ),
  },
);
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-skeletons';

export default function AdvancedAnalyticsPage() {
  const { data: heatmap = [], isLoading } = useHeatmapQuery('sales');

  if (isLoading) {
    return (
      <PageContainer className="max-w-7xl mx-auto py-6">
        <AnalyticsDashboardSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="text-slate-100 select-none text-left print:bg-white print:text-black">
      <div className="mb-4 print:hidden">
        <Link href="/bi">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>BI Dashboard</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Advanced BI Analytics"
        description="Hierarchical drill-down category trees, linked columns charts, and weekday sales density heatmaps."
      />

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Linked Drill Down Hierarchy */}
        <DrilldownCard
          title="Linked Sales Category Drilldown"
          description="Click rows to zoom into Subcategories and Product SKU level metrics."
        />

        {/* Heatmap Card */}
        <HeatmapCard
          title="Sales Checkout Hourly Density"
          description="Weekly hourly checkout density levels (emerald highlight represents high peak)."
          data={heatmap}
        />
      </div>
    </PageContainer>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ChartCard } from '@/components/analytics/chart-card';
import { StatisticsCard } from '@/components/analytics/statistics-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function CustomerInsightsPage() {
  const dummyCohort = [
    { date: 'Cohort A (VIP)', value: 88 },
    { date: 'Cohort B (Regular)', value: 65 },
    { date: 'Cohort C (Inactive)', value: 24 },
  ];

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
        title="Customer Insights Worksheet"
        description="Verify overall loyalty retention ratios, churn indexes, and customer lifetime value (LTV)."
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 my-6">
        <StatisticsCard
          title="Retention Ratio Index"
          value={76.4}
          suffix="%"
          progressValue={76.4}
          progressLabel="Target retention: 70%"
          colorClass="text-emerald-450"
        />
        <StatisticsCard
          title="Cohort Churn Index"
          value={12.8}
          suffix="%"
          isPositiveUp={false}
          progressValue={12.8}
          progressLabel="Target churn limit: 15%"
          colorClass="text-rose-455"
        />
        <StatisticsCard
          title="Avg Lifetime Value (LTV)"
          value={1245.5}
          prefix="$"
          progressValue={62}
          progressLabel="Standard target LTV: $2,000"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Cohort Retention Index"
          data={dummyCohort}
          type="bar"
          dataKeys={['value']}
          xKey="date"
          height={240}
        />
      </div>
    </PageContainer>
  );
}

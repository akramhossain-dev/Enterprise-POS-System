'use client';

import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ChartCard } from '@/components/analytics/chart-card';
import { StatisticsCard } from '@/components/analytics/statistics-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SupplierInsightsPage() {
  const dummySupplierMetrics = [
    { date: 'Global Importers', value: 96 },
    { date: 'Elite Distributors', value: 84 },
    { date: 'Direct Tech Wholesale', value: 92 },
  ];

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
        title="Supplier Insights Worksheet"
        description="Verify supplier purchase lead times, delivery accuracies, and supplier performance rankings."
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 my-6">
        <StatisticsCard
          title="Delivery Accuracy Ratio"
          value={92.4}
          suffix="%"
          progressValue={92.4}
          progressLabel="Target accuracy: 90%"
          colorClass="text-emerald-450"
        />
        <StatisticsCard
          title="Avg Lead Delay"
          value={4.2}
          suffix=" Days"
          isPositiveUp={false}
          progressValue={42}
          progressLabel="Optimal target: 3 days"
          colorClass="text-rose-455"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Delivery Accuracies by Supplier"
          data={dummySupplierMetrics}
          type="bar"
          dataKeys={['value']}
          xKey="date"
          height={240}
        />
      </div>
    </PageContainer>
  );
}

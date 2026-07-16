'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { StatisticsCard } from '@/components/analytics/statistics-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';

export default function BusinessTrendsPage() {
  const [comparePeriod, setComparePeriod] = useState<'wow' | 'mom' | 'yoy'>('mom');

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
        title="Period-over-Period Business Trends"
        description="Verify overall WoW, MoM, and YoY corporate comparisons with specific target variations."
      />

      {/* Recurrence tab choice */}
      <div className="flex border border-slate-900 bg-slate-950/40 p-0.5 rounded-lg text-xs font-bold font-sans tracking-wide my-6 print:hidden max-w-sm">
        {(
          [
            { id: 'wow', label: 'Week over Week (WoW)' },
            { id: 'mom', label: 'Month over Month (MoM)' },
            { id: 'yoy', label: 'Year over Year (YoY)' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setComparePeriod(tab.id)}
            className={`flex-1 py-1.5 rounded transition-all text-center ${
              comparePeriod === tab.id
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ratios row based on comparison period */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatisticsCard
          title="Revenue Variance"
          value={
            comparePeriod === 'wow'
              ? '$18,400'
              : comparePeriod === 'mom'
                ? '$124,500'
                : '$1,248,400'
          }
          growth={comparePeriod === 'wow' ? 2.4 : comparePeriod === 'mom' ? 12.4 : 15.6}
          progressValue={68}
          progressLabel="Relative target variation index"
          colorClass="text-emerald-450"
        />
        <StatisticsCard
          title="Operating Cost Variance"
          value={
            comparePeriod === 'wow' ? '$6,800' : comparePeriod === 'mom' ? '$48,900' : '$395,500'
          }
          growth={comparePeriod === 'wow' ? -1.2 : comparePeriod === 'mom' ? -2.5 : -5.8}
          isPositiveUp={false}
          progressValue={34}
          progressLabel="Relative budget threshold variation"
          colorClass="text-rose-455"
        />
        <StatisticsCard
          title="Operating Profit Variance"
          value={
            comparePeriod === 'wow' ? '$11,600' : comparePeriod === 'mom' ? '$75,600' : '$852,900'
          }
          growth={comparePeriod === 'wow' ? 4.8 : comparePeriod === 'mom' ? 9.8 : 12.4}
          progressValue={75}
          progressLabel="Corporate profit index variation"
        />
      </div>
    </PageContainer>
  );
}

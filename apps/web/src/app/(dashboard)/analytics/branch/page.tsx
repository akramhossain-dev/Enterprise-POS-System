'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBranchAnalyticsStats } from '@/hooks/use-analytics';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ChartCard } from '@/components/analytics/chart-card';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Store } from 'lucide-react';

export default function BranchAnalyticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: branches = [], isLoading } = useBranchAnalyticsStats({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const formatCurrency = (val: number) => {
    return (
      '$' + val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    );
  };

  if (isLoading) {
    return (
      <PageContainer className="max-w-7xl mx-auto py-6">
        <AnalyticsDashboardSkeleton />
      </PageContainer>
    );
  }

  // Map to chart share data
  const chartData = branches.map((b) => ({ name: b.branchName, value: b.revenue }));

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
        title="Branch Performance Analytics"
        description="Verify local sales counts, branch revenue generation, and net branch operating profits."
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Columns: performance list table */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
            <Store className="h-4 w-4 text-emerald-450" />
            <span>Local Branch Rankings</span>
          </h3>

          <Card className="bg-card border-border p-4 font-mono">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px] pb-2">
                    <th className="py-2">Branch Name</th>
                    <th className="py-2 text-right">Transactions</th>
                    <th className="py-2 text-right">Net Profit ($)</th>
                    <th className="py-2 text-right">Total Revenue ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-muted-foreground">
                  {branches.map((b) => (
                    <tr key={b.branchId} className="hover:bg-muted/20">
                      <td className="py-3 font-sans font-bold text-foreground">{b.branchName}</td>
                      <td className="py-3 text-right">{b.salesCount.toLocaleString()}</td>
                      <td className="py-3 text-right text-emerald-450">
                        {formatCurrency(b.profit)}
                      </td>
                      <td className="py-3 text-right text-foreground font-bold">
                        {formatCurrency(b.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: chart share */}
        <div className="md:col-span-1">
          <ChartCard title="Revenue Share by Branch" data={chartData} type="pie" height={220} />
        </div>
      </div>
    </PageContainer>
  );
}

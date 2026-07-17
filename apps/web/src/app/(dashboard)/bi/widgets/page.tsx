'use client';

import React from 'react';
import Link from 'next/link';
import { useKpisListQuery } from '@/hooks/use-bi';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sliders, CheckCircle } from 'lucide-react';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-skeletons';

export default function WidgetLibraryPage() {
  const { data: kpis = [], isLoading } = useKpisListQuery();

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
        title="BI Widget Library Registry"
        description="Verify preconfigured widget templates, active formula ratios, and caching controls."
      />

      <div className="mt-6 space-y-4 print:hidden">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
          <Sliders className="h-4 w-4 text-indigo-400" />
          <span>Active Formulas Library</span>
        </h3>

        <Card className="bg-cardard border-border p-4 font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px] pb-2">
                  <th className="py-2">Formula Name</th>
                  <th className="py-2">Formula Expression</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Value (%)</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-muted-foreground">
                {kpis.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-muted/20">
                    <td className="py-3 font-sans font-bold text-foreground">{kpi.name}</td>
                    <td className="py-3 text-muted-foreground">{kpi.formula}</td>
                    <td className="py-3 capitalize">{kpi.targetMetric}</td>
                    <td className="py-3 text-right text-emerald-450 font-bold">{kpi.value}%</td>
                    <td className="py-3 text-right">
                      <span className="flex items-center justify-end gap-1 text-emerald-450 text-[10px] font-bold">
                        <CheckCircle className="h-3 w-3" />
                        <span>Available</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

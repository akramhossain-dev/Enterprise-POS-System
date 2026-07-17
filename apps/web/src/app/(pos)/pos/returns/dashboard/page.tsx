'use client';

import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  RefreshCcw,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  ShieldAlert,
} from 'lucide-react';

export default function POSReturnsDashboardPage() {
  const metrics = [
    {
      label: 'Total Returns Count',
      value: '42 Claims',
      change: '+3% this month',
      icon: RefreshCcw,
    },
    {
      label: 'Total Refund Volume',
      value: '$2,840.50',
      change: '-12% this month',
      icon: TrendingUp,
    },
    {
      label: 'Warranty Claims',
      value: '8 Defective',
      change: 'Matched supplier specs',
      icon: ShieldAlert,
    },
    {
      label: 'Customer Exchanges',
      value: '18 Orders',
      change: 'Price difference cleared',
      icon: ShoppingBag,
    },
  ];

  const defectFrequencies = [
    { reason: 'Damaged Goods', count: 18, pct: 43 },
    { reason: 'Defective Core', count: 12, pct: 28 },
    { reason: 'Wrong Item Sent', count: 7, pct: 17 },
    { reason: 'Customer Changed Mind', count: 5, pct: 12 },
  ];

  return (
    <PageContainer className="max-w-6xl mx-auto py-6 text-foreground select-none text-left">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/pos/returns">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Returns Claims</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Sales Return Metrics Dashboard"
        description="Monitor defect frequencies, customer swap rates, warranty audits, and monthly refunds value."
      />

      {/* Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className="bg-cardard border-border text-foreground">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {m.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent className="text-left">
                <div className="text-xl font-black font-mono text-foreground">{m.value}</div>
                <p className="text-[10px] text-muted-foreground mt-1">{m.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* defect splits details */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="bg-cardard border-border text-foreground">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-muted-foreground">
              Defect Rationale Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {defectFrequencies.map((d, idx) => (
              <div key={idx} className="space-y-1.5 text-xs text-left">
                <div className="flex justify-between font-medium">
                  <span>{d.reason}</span>
                  <span className="font-mono text-muted-foreground">
                    {d.count} items ({d.pct}%)
                  </span>
                </div>
                {/* Visual Bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dynamic tips card */}
        <Card className="bg-cardard border-border text-foreground flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-355 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-amber-400" />
              <span>Supervisor Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-3 text-left">
            <p>
              1. **Damaged Goods Alert**: Damaged products have risen by 5% this week. Review
              shipping logistics or warehouse shelving.
            </p>
            <p>
              2. **Exchange Clearance**: Product exchange rates represent a net positive difference
              of +$340.50 this cycle. Cashiers are successfully upselling swapped items.
            </p>
            <p>
              3. **Warranty Settlements**: Defective supplier items can be consolidated directly in
              WMS supplier returns.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

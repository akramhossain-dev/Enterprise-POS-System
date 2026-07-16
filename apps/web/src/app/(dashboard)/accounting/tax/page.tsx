'use client';

import React from 'react';
import Link from 'next/link';
import { useTaxRates, useTaxReports } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { TaxSummaryCard } from '@/components/accounting/tax-summary-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppPieChart } from '@/components/dashboard/charts/pie-chart';
import { ArrowLeft, Settings, FileText, BadgePercent } from 'lucide-react';

export default function TaxDashboardPage() {
  const { data: rates = [] } = useTaxRates();
  const { data: report, isLoading } = useTaxReports();

  const salesTax = report?.totalSalesTax || 0;
  const purchaseTax = report?.totalPurchaseTax || 0;
  const netLiability = report?.netLiability || 0;

  // Formulate data for the Tax Distribution Chart
  const taxChartData = [
    { name: 'Output Tax (Collected)', value: salesTax, color: '#10b981' },
    { name: 'Input Tax Offset (Paid)', value: purchaseTax, color: '#f43f5e' },
  ];

  return (
    <PageContainer className="text-slate-100 select-none text-left">
      {/* Back button and quick actions */}
      <div className="mb-4 flex justify-between items-center">
        <Link href="/accounting">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Accounting Dashboard</span>
          </Button>
        </Link>

        <div className="flex gap-2">
          <Link href="/accounting/tax/rates">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-slate-800 bg-[#0c1220] hover:bg-slate-900 text-xs gap-1"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span>Tax Configuration</span>
            </Button>
          </Link>
          <Link href="/accounting/tax/reports">
            <Button
              size="sm"
              className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1"
            >
              <FileText className="h-4 w-4" />
              <span>Tax Reports</span>
            </Button>
          </Link>
        </div>
      </div>

      <PageHeader
        title="Tax Management Dashboard"
        description="Verify sales & purchase tax rates, audit quarterly VAT/GST collections, and track offset claims."
      />

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        {/* Left column: Summary Card & Configuration Details */}
        <div className="md:col-span-2 space-y-6">
          <TaxSummaryCard
            salesTax={salesTax}
            purchaseTax={purchaseTax}
            netLiability={netLiability}
          />

          {/* Tax Rates Configuration list */}
          <Card className="bg-[#0c1220] border-slate-800 text-slate-100 font-mono">
            <CardHeader className="py-4 border-b border-slate-900 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-350 uppercase tracking-widest font-sans">
                Active Tax System Matrices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {rates.length > 0 ? (
                rates.map((rate) => (
                  <div
                    key={rate.id}
                    className="flex justify-between items-center text-xs p-2.5 bg-slate-950/20 border border-slate-900 rounded-xl"
                  >
                    <div className="text-left font-sans space-y-0.5">
                      <p className="font-bold text-slate-200">{rate.name}</p>
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded tracking-wide">
                        {rate.type}
                      </span>
                    </div>

                    <span className="text-sm font-black text-emerald-450 font-mono">
                      {rate.rate}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No active tax rates defined.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Recharts Tax Chart */}
        <div className="md:col-span-1">
          <Card className="bg-[#0c1220] border-slate-800 text-slate-100 h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-900">
              <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-widest font-sans flex items-center gap-1.5">
                <BadgePercent className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>Tax Allocation Ratio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6 flex-1 flex flex-col justify-center items-center">
              {salesTax === 0 && purchaseTax === 0 ? (
                <p className="text-xs text-slate-500">No active tax records mapped.</p>
              ) : (
                <div className="w-full h-48 flex items-center justify-center">
                  <AppPieChart
                    data={taxChartData}
                    height={180}
                    showLegend={true}
                    innerRadius={40}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

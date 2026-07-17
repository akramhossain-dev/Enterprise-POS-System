'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBalanceSheet } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { StatementViewer } from '@/components/accounting/statement-viewer';
import { FormLoading } from '@/components/accounting/accounting-skeletons';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BalanceSheetPage() {
  const [date, setDate] = useState('');

  // Fetch Balance Sheet report data
  const { data: report, isLoading } = useBalanceSheet({
    date: date || undefined,
  });

  if (isLoading || !report) {
    return (
      <PageContainer className="max-w-4xl mx-auto py-6">
        <FormLoading />
      </PageContainer>
    );
  }

  const sections = [
    {
      title: 'Assets',
      items: report.assets,
      showTotal: true,
      totalLabel: 'Total Assets',
      totalValue: report.totalAssets,
    },
    {
      title: 'Liabilities',
      items: report.liabilities,
      showTotal: true,
      totalLabel: 'Total Liabilities',
      totalValue: report.totalLiabilities,
    },
    {
      title: 'Equity',
      items: report.equity,
      showTotal: true,
      totalLabel: 'Total Owner Equity',
      totalValue: report.totalEquity,
    },
  ];

  const dateHeading = date
    ? `Statement Position as of ${new Date(date).toLocaleDateString()}`
    : 'Cumulative Balance Sheet Statement';

  // In double entry, Assets must equal Liabilities + Equity
  const matchingDifference = report.totalAssets - (report.totalLiabilities + report.totalEquity);

  return (
    <PageContainer className="text-foreground select-none text-left print:bg-white print:text-black">
      {/* Back button */}
      <div className="mb-4 print:hidden">
        <Link href="/accounting">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Accounting Dashboard</span>
          </Button>
        </Link>
      </div>

      <div className="print:hidden">
        <PageHeader
          title="Balance Sheet Statement"
          description="Verify equity ratios, evaluate long-term debt offsets, and audit overall asset net values."
        />
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-1.5 bg-cardard px-3 border border-border rounded-lg text-xs h-9 w-full sm:w-auto my-6 print:hidden max-w-sm">
        <span className="text-muted-foreground">As Of Date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-transparent text-foreground focus:outline-none cursor-pointer h-full"
        />
      </div>

      {/* Sheet view */}
      <div className="space-y-6">
        <StatementViewer
          title="Balance Sheet Statement"
          subtitle={dateHeading}
          sections={sections}
          netValueLabel="Net Balance Position"
          netValue={matchingDifference}
          netValueColor={
            Math.abs(matchingDifference) < 0.01 ? 'text-emerald-400' : 'text-amber-450'
          }
          footerNotes="Reconciles total corporate assets alongside matching liabilities and equity lines. All calculations adhere to GAAP accounting rules where Assets = Liabilities + Equity. Mock transactions adjust asset books directly."
        />
      </div>
    </PageContainer>
  );
}

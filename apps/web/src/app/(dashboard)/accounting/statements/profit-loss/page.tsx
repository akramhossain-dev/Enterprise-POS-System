'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProfitLoss } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { StatementViewer } from '@/components/accounting/statement-viewer';
import { FormLoading } from '@/components/accounting/accounting-skeletons';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProfitAndLossPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch Statement data
  const { data: report, isLoading } = useProfitLoss({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
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
      title: 'Revenue / Inflows',
      items: report.revenue,
      showTotal: true,
      totalLabel: 'Total Revenue',
      totalValue: report.revenue.reduce((sum: number, r: any) => sum + r.balance, 0),
    },
    {
      title: 'Cost of Goods Sold (COGS)',
      items: report.cogs,
      showTotal: true,
      totalLabel: 'Total COGS',
      totalValue: report.cogs.reduce((sum: number, c: any) => sum + c.balance, 0),
    },
    {
      title: 'Operating Expenditures (OPEX)',
      items: report.expenses,
      showTotal: true,
      totalLabel: 'Total Expenses',
      totalValue: report.expenses.reduce((sum: number, e: any) => sum + e.balance, 0),
    },
  ];

  const dateHeading =
    startDate && endDate
      ? `From ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
      : 'Cumulative Current Fiscal Year Statement';

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
          title="Profit & Loss Statement"
          description="Evaluate company gross profitability ratios, operational overhead, and net margin outcomes."
        />
      </div>

      {/* Date Range selectors */}
      <div className="flex items-center gap-1.5 bg-cardard px-3 border border-border rounded-lg text-xs h-9 w-full sm:w-auto my-6 print:hidden max-w-sm">
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

      {/* P&L statement sheet view */}
      <StatementViewer
        title="Profit and Loss Statement (P&L)"
        subtitle={dateHeading}
        sections={sections}
        netValueLabel="Net Operating Profit"
        netValue={report.netProfit}
        netValueColor={report.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-455'}
        footerNotes="This profit & loss balance sheet includes adjustments from standard operating income receipts and verified payment vouchers. Corporate tax distributions and amortizations are reconciled at fiscal-year closing entries."
      />
    </PageContainer>
  );
}

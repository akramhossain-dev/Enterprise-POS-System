'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCashFlow } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { StatementViewer } from '@/components/accounting/statement-viewer';
import { FormLoading } from '@/components/accounting/accounting-skeletons';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CashFlowPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch Cash Flow report data
  const { data: report, isLoading } = useCashFlow({
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
      title: 'Operating Activities',
      items: report.operating.map((o: any) => ({ code: 'OP', name: o.name, balance: o.balance })),
      showTotal: true,
      totalLabel: 'Net Cash from Operating Activities',
      totalValue: report.operating.reduce((sum: number, o: any) => sum + o.balance, 0),
    },
    {
      title: 'Investing Activities',
      items: report.investing.map((i: any) => ({ code: 'INV', name: i.name, balance: i.balance })),
      showTotal: true,
      totalLabel: 'Net Cash used in Investing Activities',
      totalValue: report.investing.reduce((sum: number, i: any) => sum + i.balance, 0),
    },
    {
      title: 'Financing Activities',
      items: report.financing.map((f: any) => ({ code: 'FIN', name: f.name, balance: f.balance })),
      showTotal: true,
      totalLabel: 'Net Cash from Financing Activities',
      totalValue: report.financing.reduce((sum: number, f: any) => sum + f.balance, 0),
    },
  ];

  const dateHeading =
    startDate && endDate
      ? `From ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
      : 'Cumulative Current Cash Flow Ledger';

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
          title="Cash Flow Statement"
          description="Evaluate corporate cash liquidity, audit investments, and review net-cash adjustments."
        />
      </div>

      {/* Date filters */}
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

      {/* Sheet view */}
      <StatementViewer
        title="Statement of Cash Flows"
        subtitle={dateHeading}
        sections={sections}
        netValueLabel="Net Increase in Cash"
        netValue={report.netCashFlow}
        netValueColor={report.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-455'}
        footerNotes="Summarizes incoming and outgoing liquid assets. Reconciles operating sales revenues, corporate asset investments, owner equity cash float changes, and long-term financing debts."
      />
    </PageContainer>
  );
}

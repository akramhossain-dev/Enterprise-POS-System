'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGeneralLedger } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { LedgerTable } from '@/components/accounting/ledger-table';
import { TableSkeleton } from '@/components/accounting/accounting-skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, FileDown } from 'lucide-react';
import { toast } from 'sonner';

export default function GeneralLedgerPage() {
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch general ledger
  const { data: transactions = [], isLoading } = useGeneralLedger({
    q: query || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Reference',
      'Account Code',
      'Account Name',
      'Description',
      'Debit ($)',
      'Credit ($)',
      'Running Balance ($)',
      'Type',
    ];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.referenceNumber,
      t.accountCode,
      t.accountName,
      t.description.replace(/,/g, ' '), // sanitize
      t.debitAmount,
      t.creditAmount,
      t.runningBalance,
      t.transactionType,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'general_ledger_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('General Ledger exported to CSV.');
  };

  return (
    <PageContainer className="text-foreground select-none text-left">
      {/* Back to Accounting Dashboard */}
      <div className="mb-4">
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

      <PageHeader
        title="General Ledger Book"
        description="Consolidate all double-entry journal movements, verify audit trails, and review net-balance accounts registers."
      />

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between mt-4 mb-6">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search code, name, or ref..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 bg-muted border-border text-foreground text-xs focus-visible:ring-emerald-500 h-9"
            />
          </div>

          {/* Date Range selectors */}
          <div className="flex items-center gap-1.5 bg-card px-3 border border-border rounded-lg text-xs h-9">
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
        </div>

        {transactions.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="h-8 border-border bg-card hover:bg-accent text-xs gap-1.5 w-full md:w-auto"
          >
            <FileDown className="h-4 w-4 text-slate-450" />
            <span>Export CSV</span>
          </Button>
        )}
      </div>

      {/* Main Ledger Table */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : (
        <LedgerTable transactions={transactions} showAccountColumn={true} isLoading={isLoading} />
      )}
    </PageContainer>
  );
}

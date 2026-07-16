'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccountLedger, useAccounts } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { BalanceSummary } from '@/components/accounting/balance-summary';
import { LedgerTable } from '@/components/accounting/ledger-table';
import { TransactionTimeline } from '@/components/accounting/transaction-timeline';
import { LedgerSkeleton } from '@/components/accounting/accounting-skeletons';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, FileDown } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountLedgerPage() {
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [txType, setTxType] = useState('ALL');

  // Load account selector choices
  const { data: accData } = useAccounts({ limit: 100 });
  const accounts = accData?.data || [];

  // Fetch account ledger data
  const { data: ledgerData, isLoading } = useAccountLedger(selectedAccountId, {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    type: txType === 'ALL' ? undefined : txType,
  });

  const transactions = ledgerData?.transactions || [];
  const summary = ledgerData?.summary || {
    openingBalance: 0,
    totalDebit: 0,
    totalCredit: 0,
    closingBalance: 0,
  };

  const handleExportCSV = () => {
    if (!selectedAccountId) return;
    const selectedAcc = accounts.find((a) => a.id === selectedAccountId);
    const headers = [
      'Date',
      'Reference',
      'Description',
      'Debit ($)',
      'Credit ($)',
      'Running Balance ($)',
      'Type',
    ];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.referenceNumber,
      t.description.replace(/,/g, ' '),
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
    link.setAttribute('download', `account_ledger_${selectedAcc?.code || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Account Ledger exported to CSV.');
  };

  return (
    <PageContainer className="text-slate-100 select-none text-left">
      {/* Back home */}
      <div className="mb-4">
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
      </div>

      <PageHeader
        title="Account Ledger Statement"
        description="Filter specific account ledger movements, audit timelines, and extract clean balance worksheets."
      />

      {/* Account Selector and Filters bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between mt-4 mb-6">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Account Selector */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-[#0c1220] border border-slate-850 text-slate-200 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[220px] font-bold font-mono"
          >
            <option value="">-- Choose Account * --</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.name} ({a.type})
              </option>
            ))}
          </select>

          {/* Date range filters */}
          <div className="flex items-center gap-1.5 bg-[#0c1220] px-3 border border-slate-850 rounded-lg text-xs h-9">
            <span className="text-slate-500">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer h-full"
            />
            <span className="text-slate-500">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer h-full"
            />
          </div>

          {/* Tx Type Selector */}
          <select
            value={txType}
            onChange={(e) => setTxType(e.target.value)}
            className="bg-[#0c1220] border border-slate-850 text-slate-350 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[120px]"
          >
            <option value="ALL">All Types</option>
            <option value="JOURNAL">Journals</option>
            <option value="INCOME">Income Book</option>
            <option value="EXPENSE">Expense Book</option>
            <option value="VOUCHER">Vouchers</option>
          </select>
        </div>

        {selectedAccountId && transactions.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="h-8 border-slate-800 bg-[#0c1220] hover:bg-slate-900 text-xs gap-1.5 w-full md:w-auto"
          >
            <FileDown className="h-4 w-4 text-slate-450" />
            <span>Export CSV</span>
          </Button>
        )}
      </div>

      {/* Main Ledger Content */}
      {!selectedAccountId ? (
        <div className="text-center py-20 border border-dashed border-slate-850 rounded-2xl text-slate-500">
          <BookOpen className="h-8 w-8 text-slate-700 mx-auto mb-2" />
          <p className="text-xs">
            Please select an account from the dropdown above to construct the ledger report.
          </p>
        </div>
      ) : isLoading ? (
        <LedgerSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Summary Metric Cards Row */}
          <BalanceSummary
            openingBalance={summary.openingBalance}
            inflow={summary.totalDebit}
            outflow={summary.totalCredit}
            currentBalance={summary.closingBalance}
            inflowLabel="Total Debits"
            outflowLabel="Total Credits"
            balanceLabel="Closing Balance"
          />

          {/* Table vs Timeline Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Table detail list */}
            <div className="md:col-span-2 space-y-4">
              <LedgerTable
                transactions={transactions}
                showAccountColumn={false}
                isLoading={isLoading}
              />
            </div>

            {/* Visual vertical timeline */}
            <div className="md:col-span-1">
              <TransactionTimeline entries={transactions} loading={isLoading} />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

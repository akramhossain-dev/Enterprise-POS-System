'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBankBook } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { BalanceSummary } from '@/components/accounting/balance-summary';
import { TableSkeleton } from '@/components/accounting/accounting-skeletons';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function BankBookPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch Bank Book ledger
  const { data: bankBook, isLoading } = useBankBook({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const transactions = bankBook?.transactions || [];
  const summary = bankBook?.summary || {
    openingBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    currentBalance: 0,
  };

  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  return (
    <PageContainer className="text-foreground select-none text-left">
      {/* Back link */}
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
        title="Bank Book Ledger"
        description="Monitor bank deposits, trace outward electronic transfers, and audit operating account balances."
      />

      {/* Date Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4 mb-6">
        <div className="flex items-center gap-1.5 bg-card px-3 border border-slate-855 rounded-lg text-xs h-9 w-full sm:w-auto">
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

      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <div className="space-y-6">
          {/* Metrics summary boxes */}
          <BalanceSummary
            openingBalance={summary.openingBalance}
            inflow={summary.totalDeposits}
            outflow={summary.totalWithdrawals}
            currentBalance={summary.currentBalance}
            inflowLabel="Deposits"
            outflowLabel="Withdrawals"
            balanceLabel="Current Balance"
          />

          {/* Transactions lists table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 bg-muted/40 border-b border-border flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 font-sans">
                <Building2 className="h-4 w-4 text-indigo-400" />
                <span>Commercial Operating Statements</span>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-855 text-muted-foreground font-bold uppercase tracking-wider text-[10px] bg-slate-955/35">
                    <th className="py-3 px-4 font-mono">Date</th>
                    <th className="py-3 px-3 font-mono">Ref / ID</th>
                    <th className="py-3 px-4">Description Memo</th>
                    <th className="py-3 px-3 text-right font-mono">Deposits (+)</th>
                    <th className="py-3 px-3 text-right font-mono">Withdrawals (-)</th>
                    <th className="py-3 px-4 text-right font-mono">Running Balance ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium text-muted-foreground font-mono">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-accent/40">
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-250">{tx.reference}</td>
                        <td className="py-3 px-4 text-left font-sans text-foreground truncate max-w-[250px]">
                          {tx.description}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-400">
                          {tx.deposits > 0 ? `+${formatCurrency(tx.deposits)}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-rose-455">
                          {tx.withdrawals > 0 ? `-${formatCurrency(tx.withdrawals)}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-foreground">
                          {formatCurrency(tx.runningBalance)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-muted-foreground font-sans border-none"
                      >
                        No bank transactions found in this book period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

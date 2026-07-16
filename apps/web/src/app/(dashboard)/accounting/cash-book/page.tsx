'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCashBook } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { BalanceSummary } from '@/components/accounting/balance-summary';
import { TableSkeleton } from '@/components/accounting/accounting-skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Wallet } from 'lucide-react';

export default function CashBookPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch Cash Book data
  const { data: cashBook, isLoading } = useCashBook({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const transactions = cashBook?.transactions || [];
  const summary = cashBook?.summary || {
    openingBalance: 0,
    totalCashIn: 0,
    totalCashOut: 0,
    currentBalance: 0,
  };

  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  return (
    <PageContainer className="text-slate-100 select-none text-left">
      {/* Back button */}
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
        title="Cash Book Ledger"
        description="Verify daily cash-drawer inflows, monitor safe float deposits, and review running cash balances."
      />

      {/* Date filters toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4 mb-6">
        <div className="flex items-center gap-1.5 bg-[#0c1220] px-3 border border-slate-850 rounded-lg text-xs h-9 w-full sm:w-auto">
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
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <div className="space-y-6">
          {/* Balance Cards Summary */}
          <BalanceSummary
            openingBalance={summary.openingBalance}
            inflow={summary.totalCashIn}
            outflow={summary.totalCashOut}
            currentBalance={summary.currentBalance}
            inflowLabel="Cash In"
            outflowLabel="Cash Out"
            balanceLabel="Current Balance"
          />

          {/* Transactions Log Table */}
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-950/40 border-b border-slate-900 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                <Wallet className="h-4 w-4 text-emerald-400" />
                <span>Cash Registers Log</span>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-855 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-955/35">
                    <th className="py-3 px-4 font-mono">Date</th>
                    <th className="py-3 px-3 font-mono">Ref / ID</th>
                    <th className="py-3 px-4">Description Memo</th>
                    <th className="py-3 px-3 text-right font-mono">Cash In (+)</th>
                    <th className="py-3 px-3 text-right font-mono">Cash Out (-)</th>
                    <th className="py-3 px-4 text-right font-mono">Running Balance ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium text-slate-350 font-mono">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-200">{tx.reference}</td>
                        <td className="py-3 px-4 text-left font-sans text-slate-300 truncate max-w-[250px]">
                          {tx.description}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-400">
                          {tx.cashIn > 0 ? `+${formatCurrency(tx.cashIn)}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-rose-455">
                          {tx.cashOut > 0 ? `-${formatCurrency(tx.cashOut)}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-200">
                          {formatCurrency(tx.runningBalance)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-slate-500 font-sans border-none"
                      >
                        No cash transactions logged in this book period.
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

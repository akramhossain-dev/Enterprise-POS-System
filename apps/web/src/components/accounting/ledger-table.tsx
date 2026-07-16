'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, ArrowRightLeft } from 'lucide-react';
import type { LedgerTransaction } from '@/types/accounting';
import { cn } from '@/utils/cn';

interface LedgerTableProps {
  transactions: LedgerTransaction[];
  showAccountColumn?: boolean;
  onExportCSV?: () => void;
  isLoading?: boolean;
}

export function LedgerTable({
  transactions,
  showAccountColumn = false,
  onExportCSV,
  isLoading = false,
}: LedgerTableProps) {
  const formatCurrency = (val: number) => {
    return val === 0
      ? '-'
      : '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-3">
      {/* Top utility row */}
      {onExportCSV && (
        <div className="flex justify-end">
          <Button
            size="xs"
            onClick={onExportCSV}
            className="h-8 border border-slate-800 bg-[#0c1220] hover:bg-slate-900 text-[10px] font-bold uppercase tracking-wider gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-855 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-955/35">
                <th className="py-3 px-4 font-mono">Date</th>
                <th className="py-3 px-3 font-mono">Ref / ID</th>
                {showAccountColumn && <th className="py-3 px-4">Account</th>}
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-3 text-right font-mono">Debit ($)</th>
                <th className="py-3 px-3 text-right font-mono">Credit ($)</th>
                <th className="py-3 px-4 text-right font-mono">Running Balance ($)</th>
                <th className="py-3 px-3 text-center">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-medium text-slate-350 font-mono">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={showAccountColumn ? 8 : 7}
                    className="py-10 text-center text-slate-500 font-sans"
                  >
                    Processing ledger queries...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-300">{tx.referenceNumber}</td>
                    {showAccountColumn && (
                      <td className="py-3 px-4 font-sans text-left text-slate-200">
                        <span className="font-bold font-mono text-xs block text-slate-400">
                          {tx.accountCode}
                        </span>
                        <span className="text-xs truncate block max-w-[150px]">
                          {tx.accountName}
                        </span>
                      </td>
                    )}
                    <td className="py-3 px-4 text-left font-sans text-slate-300 truncate max-w-[200px]">
                      {tx.description}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {formatCurrency(tx.debitAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-455">
                      {formatCurrency(tx.creditAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-200">
                      ${tx.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span
                        className={cn(
                          'inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider',
                          tx.transactionType === 'JOURNAL' &&
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                          tx.transactionType === 'INCOME' &&
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                          tx.transactionType === 'EXPENSE' &&
                            'bg-rose-500/10 text-rose-455 border border-rose-500/20',
                          tx.transactionType === 'VOUCHER' &&
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                        )}
                      >
                        {tx.transactionType}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={showAccountColumn ? 8 : 7}
                    className="py-12 text-center text-slate-500 border-none font-sans"
                  >
                    No transaction entries recorded in this ledger period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

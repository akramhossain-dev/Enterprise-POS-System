'use client';

import React from 'react';
import Link from 'next/link';
import { useTrialBalance } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { TableSkeleton } from '@/components/accounting/accounting-skeletons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, ShieldAlert, FileDown, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function TrialBalancePage() {
  const { data: report, isLoading } = useTrialBalance();

  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const handleExportCSV = () => {
    if (!report) return;
    const headers = ['Account Code', 'Account Name', 'Debit Balance ($)', 'Credit Balance ($)'];
    const rows = report.items.map((i: any) => [
      i.code,
      i.name.replace(/,/g, ' '),
      i.debit,
      i.credit,
    ]);
    rows.push(['', 'Total Balanced', report.totalDebit.toString(), report.totalCredit.toString()]);
    rows.push(['', 'Discrepancy Difference', report.difference.toString(), '']);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'trial_balance_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Trial Balance exported to CSV.');
  };

  if (isLoading || !report) {
    return (
      <PageContainer className="max-w-4xl mx-auto py-6">
        <TableSkeleton rows={8} cols={4} />
      </PageContainer>
    );
  }

  const isBalanced = report.difference < 0.01;

  return (
    <PageContainer className="text-foreground select-none text-left print:bg-white print:text-black print:p-0">
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
          title="Trial Balance Worksheet"
          description="Validate double-entry accounts balancing. Total debit balances must equal total credit balances."
        />
      </div>

      {/* Verification alerts banner */}
      <div className="my-6 space-y-6">
        <div
          className={cn(
            'p-4 rounded-3xl border flex items-center justify-between print:hidden',
            isBalanced
              ? 'border-emerald-500/25 bg-emerald-500/[0.02] text-emerald-400'
              : 'border-rose-500/25 bg-rose-500/[0.02] text-rose-455',
          )}
        >
          <div className="flex items-center gap-3">
            {isBalanced ? (
              <ShieldCheck className="h-8 w-8 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="h-8 w-8 text-rose-455 shrink-0 animate-pulse" />
            )}
            <div className="space-y-0.5 text-left">
              <h4 className="text-xs font-black uppercase tracking-wider font-sans">
                {isBalanced
                  ? 'Trial Balance Reconciled & Balanced'
                  : 'Trial Balance Discrepancy Found'}
              </h4>
              <p className="text-[10px] text-slate-450 leading-normal">
                {isBalanced
                  ? 'Reconciliation audit completed. Total Debit matches Total Credit exactly.'
                  : `ledger balancing error. There is a discrepancy of ${formatCurrency(
                      report.difference,
                    )} between debits and credits.`}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="h-8 border-border bg-cardard hover:bg-accent text-xs gap-1.5"
            >
              <FileDown className="h-4 w-4 text-slate-455" />
              <span>Export CSV</span>
            </Button>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Print Sheet</span>
            </Button>
          </div>
        </div>

        {/* Trial balance table worksheet */}
        <Card className="bg-cardard border-border text-foreground print:bg-white print:text-black print:border-none print:shadow-none">
          <CardContent className="p-6">
            <div className="text-center border-b border-slate-855 pb-4 print:border-black mb-6">
              <h2 className="text-base font-black uppercase text-foreground print:text-black font-sans tracking-wide">
                Trial Balance Statement
              </h2>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Current Fiscal Year Position
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-855 text-muted-foreground font-bold uppercase tracking-wider text-[10px] bg-slate-955/35 print:border-black">
                    <th className="py-3 px-4 font-mono">Code</th>
                    <th className="py-3 px-4">Account Name</th>
                    <th className="py-3 px-3 text-right font-mono">Debit Balance ($)</th>
                    <th className="py-3 px-4 text-right font-mono">Credit Balance ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-medium text-muted-foreground font-mono print:divide-gray-200">
                  {report.items.map((item: any) => (
                    <tr key={item.accountId} className="hover:bg-accent/20">
                      <td className="py-2.5 px-4 text-muted-foreground">{item.code}</td>
                      <td className="py-2.5 px-4 font-sans text-foreground print:text-black font-bold">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 text-right text-foreground print:text-black">
                        {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right text-foreground print:text-black">
                        {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                      </td>
                    </tr>
                  ))}

                  {/* Summary Totals Row */}
                  <tr className="border-t-2 border-slate-700 font-black text-foreground print:border-black print:text-black bg-slate-955/40">
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4 font-sans">Total Balanced Sum</td>
                    <td className="py-3 px-3 text-right font-black">
                      {formatCurrency(report.totalDebit)}
                    </td>
                    <td className="py-3 px-4 text-right font-black">
                      {formatCurrency(report.totalCredit)}
                    </td>
                  </tr>

                  {/* Discrepancy Difference Row */}
                  <tr className="text-slate-450">
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4 font-sans text-xs">Unreconciled Difference</td>
                    <td
                      colSpan={2}
                      className={cn(
                        'py-3 px-4 text-right font-black font-mono text-xs',
                        isBalanced ? 'text-emerald-400' : 'text-rose-455',
                      )}
                    >
                      {formatCurrency(report.difference)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

// Utility style class
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

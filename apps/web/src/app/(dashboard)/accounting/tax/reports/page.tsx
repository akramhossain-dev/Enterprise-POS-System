'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTaxReports } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { BalanceSummary } from '@/components/accounting/balance-summary';
import { TableSkeleton } from '@/components/accounting/accounting-skeletons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, FileDown, Printer, Scale } from 'lucide-react';
import { toast } from 'sonner';

export default function TaxReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [taxType, setTaxType] = useState('ALL');

  // Fetch report data
  const { data: report, isLoading } = useTaxReports({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const transactions = report?.transactions || [];
  const filteredTx = transactions.filter((t: any) => {
    if (taxType === 'ALL') return true;
    return t.type === taxType;
  });

  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const handleExportCSV = () => {
    if (!report) return;
    const headers = [
      'Date',
      'Reference',
      'Type',
      'Amount ($)',
      'Tax Rate (%)',
      'Tax Code',
      'Tax Collected ($)',
    ];
    const rows = filteredTx.map((t: any) => [
      new Date(t.date).toLocaleDateString(),
      t.reference,
      t.type,
      t.amount.toString(),
      t.taxRate.toString(),
      t.taxRateName.replace(/,/g, ' '),
      t.taxAmount.toString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tax_liability_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Tax report sheet exported to CSV.');
  };

  return (
    <PageContainer className="text-foreground select-none text-left print:bg-white print:text-black print:p-0">
      {/* Back link */}
      <div className="mb-4 flex justify-between items-center print:hidden">
        <Link href="/accounting/tax">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Tax Dashboard</span>
          </Button>
        </Link>

        {report && (
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
        )}
      </div>

      <div className="print:hidden">
        <PageHeader
          title="Tax Settlement Reports"
          description="View ledger logs representing collected sales (output) taxes against paid purchase (input) tax credits."
        />
      </div>

      {/* Date filters and class selection */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4 mb-6 print:hidden">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-cardard px-3 border border-border rounded-lg text-xs h-9">
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

          <select
            value={taxType}
            onChange={(e) => setTaxType(e.target.value)}
            className="bg-cardard border border-border text-muted-foreground rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[140px]"
          >
            <option value="ALL">All Tax Classes</option>
            <option value="SALES">Output Tax (Sales)</option>
            <option value="PURCHASE">Input Tax (Purchases)</option>
          </select>
        </div>
      </div>

      {isLoading || !report ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <div className="space-y-6">
          {/* Summary Banner */}
          <BalanceSummary
            openingBalance={0} // Not applicable for tax period liability
            inflow={report.totalSalesTax}
            outflow={report.totalPurchaseTax}
            currentBalance={report.netLiability}
            inflowLabel="Output Tax"
            outflowLabel="Input Tax Offset"
            balanceLabel="Net Tax Liability"
          />

          {/* Transactions details */}
          <Card className="bg-cardard border-border text-foreground print:bg-white print:text-black print:border-none print:shadow-none">
            <CardContent className="p-6">
              <div className="text-center border-b border-slate-855 pb-4 print:border-black mb-6">
                <h2 className="text-base font-black uppercase text-foreground print:text-black font-sans tracking-wide">
                  Corporate Tax Transactions Audit Ledger
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Tax liabilities matching standard POS invoices & vendor vouchers
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-855 text-muted-foreground font-bold uppercase tracking-wider text-[10px] bg-slate-955/35 print:border-black">
                      <th className="py-3 px-4 font-mono">Date</th>
                      <th className="py-3 px-4 font-mono">Reference</th>
                      <th className="py-3 px-3 text-center">Type</th>
                      <th className="py-3 px-4">Tax Code Classification</th>
                      <th className="py-3 px-3 text-right font-mono">Base Amount ($)</th>
                      <th className="py-3 px-4 text-right font-mono">Tax Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 font-medium text-muted-foreground font-mono print:divide-gray-200">
                    {filteredTx.length > 0 ? (
                      filteredTx.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-accent/20">
                          <td className="py-2.5 px-4 text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-4 text-foreground print:text-black font-bold">
                            {tx.reference}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={cn(
                                'inline-block px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase',
                                tx.type === 'SALES'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-455',
                              )}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-sans text-muted-foreground">{tx.taxRateName}</td>
                          <td className="py-2.5 px-3 text-right text-foreground print:text-black">
                            {formatCurrency(tx.amount)}
                          </td>
                          <td
                            className={cn(
                              'py-2.5 px-4 text-right font-black',
                              tx.type === 'SALES'
                                ? 'text-emerald-400'
                                : 'text-slate-250 print:text-black',
                            )}
                          >
                            {formatCurrency(tx.taxAmount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-muted-foreground font-sans border-none"
                        >
                          No tax transactions logged under this selected period.
                        </td>
                      </tr>
                    )}

                    {/* Summary row */}
                    {filteredTx.length > 0 && (
                      <tr className="border-t-2 border-slate-700 font-black text-foreground print:border-black print:text-black bg-slate-955/40">
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4 font-sans" colSpan={3}>
                          Net Report Tax Liability Accumulation
                        </td>
                        <td
                          colSpan={2}
                          className={cn(
                            'py-3 px-4 text-right font-black font-mono',
                            report.netLiability >= 0 ? 'text-rose-455' : 'text-emerald-400',
                          )}
                        >
                          {formatCurrency(report.netLiability)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

// Utility styles matching POS standard
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

'use client';

import React from 'react';
import Link from 'next/link';
import { useAccountingDashboard, useAccounts } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { FinancialSummaryCard } from '@/components/accounting/financial-summary-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wallet2,
  TrendingUp,
  TrendingDown,
  Building,
  DollarSign,
  Briefcase,
  Users,
  FolderOpen,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export default function AccountingDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAccountingDashboard();
  const { data: accData, isLoading: accountsLoading } = useAccounts({ limit: 5 });

  const recentAccounts = accData?.data || [];

  return (
    <PageContainer className="text-foreground select-none text-left">
      <div className="flex justify-between items-center mb-4">
        <PageHeader
          title="Accounting & Finance Control"
          description="Monitor real-time ledger assets, balance liabilities, operating income, and cash flows."
        />

        <div className="flex space-x-2 shrink-0">
          <Link href="/accounting/accounts">
            <Button
              size="sm"
              className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider"
            >
              <span>Chart of Accounts</span>
            </Button>
          </Link>
          <Link href="/accounting/groups">
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-border bg-card hover:bg-accent text-xs"
            >
              <span>Groups</span>
            </Button>
          </Link>
          <Link href="/accounting/categories">
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-border bg-card hover:bg-accent text-xs"
            >
              <span>Categories</span>
            </Button>
          </Link>
        </div>
      </div>

      {statsLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Compiling financial metrics...
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Main metrics grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FinancialSummaryCard
              label="Total Assets"
              value={stats.totalAssets}
              change="+4.2% since start"
              icon={Briefcase}
              color="text-emerald-400"
            />
            <FinancialSummaryCard
              label="Total Liabilities"
              value={stats.totalLiabilities}
              change="-2.1% debt offset"
              isPositiveChange={false}
              icon={Building}
              color="text-rose-455"
            />
            <FinancialSummaryCard
              label="Total Income"
              value={stats.totalIncome}
              change="+18.5% pos sales"
              icon={TrendingUp}
              color="text-emerald-400"
            />
            <FinancialSummaryCard
              label="Total Expenses"
              value={stats.totalExpenses}
              change="+5.1% operating"
              isPositiveChange={false}
              icon={TrendingDown}
              color="text-rose-455"
            />
          </div>

          {/* Cash/Bank Receivables row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/accounting/cash-book" className="hover:scale-[1.01] transition-transform">
              <Card className="bg-card border-border hover:border-slate-700">
                <CardHeader className="py-3 border-b border-border flex flex-row justify-between items-center space-y-0">
                  <CardTitle className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    Cash Book Balance
                  </CardTitle>
                  <Wallet2 className="h-3.5 w-3.5 text-emerald-400" />
                </CardHeader>
                <CardContent className="py-3">
                  <p className="text-lg font-black font-mono text-emerald-400">
                    ${stats.cashBalance.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    Petty Cash registers (View Book)
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/accounting/bank-book" className="hover:scale-[1.01] transition-transform">
              <Card className="bg-card border-border hover:border-slate-700">
                <CardHeader className="py-3 border-b border-border flex flex-row justify-between items-center space-y-0">
                  <CardTitle className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                    Bank Book Balance
                  </CardTitle>
                  <Building className="h-3.5 w-3.5 text-emerald-400" />
                </CardHeader>
                <CardContent className="py-3">
                  <p className="text-lg font-black font-mono text-emerald-400">
                    ${stats.bankBalance.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    Operating bank accounts (View Book)
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card className="bg-card border-border">
              <CardHeader className="py-3 border-b border-border flex flex-row justify-between items-center space-y-0">
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Receivables Due
                </CardTitle>
                <Users className="h-3.5 w-3.5 text-amber-450" />
              </CardHeader>
              <CardContent className="py-3">
                <p className="text-lg font-black font-mono text-amber-400">
                  ${stats.receivableAmount.toFixed(2)}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Outstanding customer ledger
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="py-3 border-b border-border flex flex-row justify-between items-center space-y-0">
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Payables Due
                </CardTitle>
                <Building className="h-3.5 w-3.5 text-rose-455" />
              </CardHeader>
              <CardContent className="py-3">
                <p className="text-lg font-black font-mono text-rose-455">
                  ${stats.payableAmount.toFixed(2)}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Outstanding vendor invoices
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Books Links grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-left">
              Operating Ledgers & Cashbooks
            </h3>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <Link href="/accounting/journals" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-4 text-center cursor-pointer space-y-2 h-24 flex flex-col justify-center">
                  <p className="text-xs font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Journals
                  </p>
                  <p className="text-[9px] text-muted-foreground">Record adjusting entries</p>
                </Card>
              </Link>

              <Link href="/accounting/general-ledger" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-4 text-center cursor-pointer space-y-2 h-24 flex flex-col justify-center">
                  <p className="text-xs font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    General Ledger
                  </p>
                  <p className="text-[9px] text-muted-foreground">Aggregate ledger sheets</p>
                </Card>
              </Link>

              <Link href="/accounting/account-ledger" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-4 text-center cursor-pointer space-y-2 h-24 flex flex-col justify-center">
                  <p className="text-xs font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Account Ledger
                  </p>
                  <p className="text-[9px] text-muted-foreground">Detailed account statements</p>
                </Card>
              </Link>

              <Link href="/accounting/income" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-4 text-center cursor-pointer space-y-2 h-24 flex flex-col justify-center">
                  <p className="text-xs font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Income Book
                  </p>
                  <p className="text-[9px] text-muted-foreground">Track miscellaneous revenue</p>
                </Card>
              </Link>

              <Link href="/accounting/expense" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-4 text-center cursor-pointer space-y-2 h-24 flex flex-col justify-center">
                  <p className="text-xs font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Expense Book
                  </p>
                  <p className="text-[9px] text-muted-foreground">Log company expenditures</p>
                </Card>
              </Link>

              <Link href="/accounting/payment-vouchers" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-4 text-center cursor-pointer space-y-2 h-24 flex flex-col justify-center">
                  <p className="text-xs font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Vouchers
                  </p>
                  <p className="text-[9px] text-muted-foreground">Process receipts/payments</p>
                </Card>
              </Link>
            </div>
          </div>

          {/* Financial Reporting & Period Closures Links grid */}
          <div className="space-y-3 mt-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-left">
              Financial Reporting & Period Closures
            </h3>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
              <Link href="/accounting/statements/profit-loss" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-3 text-center cursor-pointer space-y-1.5 h-22 flex flex-col justify-center">
                  <p className="text-[11px] font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Profit & Loss
                  </p>
                  <p className="text-[8px] text-muted-foreground">Revenue & net margin</p>
                </Card>
              </Link>

              <Link href="/accounting/statements/balance-sheet" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-3 text-center cursor-pointer space-y-1.5 h-22 flex flex-col justify-center">
                  <p className="text-[11px] font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Balance Sheet
                  </p>
                  <p className="text-[8px] text-muted-foreground">Assets & equity position</p>
                </Card>
              </Link>

              <Link href="/accounting/statements/cash-flow" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-3 text-center cursor-pointer space-y-1.5 h-22 flex flex-col justify-center">
                  <p className="text-[11px] font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Cash Flow
                  </p>
                  <p className="text-[8px] text-muted-foreground">Trace liquid inflows</p>
                </Card>
              </Link>

              <Link href="/accounting/statements/trial-balance" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-3 text-center cursor-pointer space-y-1.5 h-22 flex flex-col justify-center">
                  <p className="text-[11px] font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Trial Balance
                  </p>
                  <p className="text-[8px] text-muted-foreground">Double-entry balancing</p>
                </Card>
              </Link>

              <Link href="/accounting/tax" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-3 text-center cursor-pointer space-y-1.5 h-22 flex flex-col justify-center">
                  <p className="text-[11px] font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Tax Desk
                  </p>
                  <p className="text-[8px] text-muted-foreground">VAT/GST management</p>
                </Card>
              </Link>

              <Link href="/accounting/periods" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-3 text-center cursor-pointer space-y-1.5 h-22 flex flex-col justify-center">
                  <p className="text-[11px] font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Periods Setup
                  </p>
                  <p className="text-[8px] text-muted-foreground">Fiscal year calendars</p>
                </Card>
              </Link>

              <Link href="/accounting/closing" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-3 text-center cursor-pointer space-y-1.5 h-22 flex flex-col justify-center">
                  <p className="text-[11px] font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Period Close
                  </p>
                  <p className="text-[8px] text-muted-foreground">Month-end lock checklists</p>
                </Card>
              </Link>

              <Link href="/accounting/audit" className="group">
                <Card className="bg-card border-border group-hover:border-slate-700 p-3 text-center cursor-pointer space-y-1.5 h-22 flex flex-col justify-center">
                  <p className="text-[11px] font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase font-mono tracking-wider">
                    Audit Trail
                  </p>
                  <p className="text-[8px] text-muted-foreground">Compliance activity logs</p>
                </Card>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Visual chart placeholder */}
            <Card className="md:col-span-2 bg-card border-border text-foreground flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold text-foreground">
                  Monthly Profitability Overview
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Income vs expense balance mappings. Net profitability ratio:{' '}
                  <span className="text-emerald-400 font-bold font-mono">66.6%</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 flex-1 flex items-end justify-between gap-6 h-60 max-w-lg mx-auto font-mono text-xs">
                {/* Visual bar grids */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-t-lg h-32 relative flex items-end justify-center">
                    <div className="bg-emerald-400 w-full rounded-t h-2/3" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">Income</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 bg-rose-500/10 border border-rose-500/20 rounded-t-lg h-32 relative flex items-end justify-center">
                    <div className="bg-rose-455 w-full rounded-t h-1/3" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">Expenses</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-t-lg h-32 relative flex items-end justify-center">
                    <div className="bg-emerald-400 w-full rounded-t h-1/2" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">Net Profit</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Accounts list */}
            <Card className="md:col-span-1 bg-card border-border text-foreground">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold text-muted-foreground">
                  Recent Ledger Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2.5">
                {recentAccounts.slice(0, 4).map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center text-xs">
                    <div className="text-left min-w-0">
                      <p className="font-bold text-foreground truncate">{acc.name}</p>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        Code: {acc.code}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-foreground">
                        ${acc.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground text-xs">
          No stats data compiled.
        </div>
      )}
    </PageContainer>
  );
}

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
    <PageContainer className="text-slate-100 select-none text-left">
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
              className="h-8 border-slate-800 bg-[#0c1220] hover:bg-slate-900 text-xs"
            >
              <span>Groups</span>
            </Button>
          </Link>
          <Link href="/accounting/categories">
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-slate-800 bg-[#0c1220] hover:bg-slate-900 text-xs"
            >
              <span>Categories</span>
            </Button>
          </Link>
        </div>
      </div>

      {statsLoading ? (
        <div className="text-center py-12 text-slate-500">Compiling financial metrics...</div>
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
              color="text-emerald-450"
            />
            <FinancialSummaryCard
              label="Total Expenses"
              value={stats.totalExpenses}
              change="+5.1% warehouse"
              isPositiveChange={false}
              icon={TrendingDown}
              color="text-rose-400"
            />
          </div>

          {/* Cash/Bank Receivables row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-[#0c1220] border-slate-800">
              <CardHeader className="py-3 border-b border-slate-900">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cash Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <p className="text-lg font-black font-mono text-emerald-400">
                  ${stats.cashBalance.toFixed(2)}
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5">Petty Cash registers</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0c1220] border-slate-800">
              <CardHeader className="py-3 border-b border-slate-900">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Bank Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <p className="text-lg font-black font-mono text-emerald-400">
                  ${stats.bankBalance.toFixed(2)}
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5">Central operating deposits</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0c1220] border-slate-800">
              <CardHeader className="py-3 border-b border-slate-900">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Receivables Due
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <p className="text-lg font-black font-mono text-amber-400">
                  ${stats.receivableAmount.toFixed(2)}
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5">Customer outstanding ledger</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0c1220] border-slate-800">
              <CardHeader className="py-3 border-b border-slate-900">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Payables Due
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <p className="text-lg font-black font-mono text-rose-455">
                  ${stats.payableAmount.toFixed(2)}
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5">Supplier pending checks</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Visual chart placeholder */}
            <Card className="md:col-span-2 bg-[#0c1220] border-slate-800 text-slate-100 flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-900">
                <CardTitle className="text-sm font-bold text-slate-350">
                  Monthly Profitability Overview
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs">
                  Income vs expense balance mappings. Net profitability ratio:{' '}
                  <span className="text-emerald-400 font-bold font-mono">66.6%</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 flex-1 flex items-end justify-between gap-6 h-60 max-w-lg mx-auto font-mono text-xs">
                {/* Visual bar grids */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-t-lg h-32 relative flex items-end justify-center">
                    <div className="bg-emerald-450 w-full rounded-t h-2/3" />
                  </div>
                  <span className="text-[10px] text-slate-500">Income</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 bg-rose-500/10 border border-rose-500/20 rounded-t-lg h-32 relative flex items-end justify-center">
                    <div className="bg-rose-455 w-full rounded-t h-1/3" />
                  </div>
                  <span className="text-[10px] text-slate-500">Expenses</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-t-lg h-32 relative flex items-end justify-center">
                    <div className="bg-emerald-400 w-full rounded-t h-1/2" />
                  </div>
                  <span className="text-[10px] text-slate-500">Net Profit</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Accounts list */}
            <Card className="md:col-span-1 bg-[#0c1220] border-slate-800 text-slate-100">
              <CardHeader className="pb-3 border-b border-slate-900">
                <CardTitle className="text-sm font-bold text-slate-350">
                  Recent Ledger Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2.5">
                {recentAccounts.slice(0, 4).map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center text-xs">
                    <div className="text-left min-w-0">
                      <p className="font-bold text-slate-200 truncate">{acc.name}</p>
                      <span className="font-mono text-[10px] text-slate-500">Code: {acc.code}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-300">
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
        <div className="text-center py-20 border border-dashed border-slate-850 rounded-2xl text-slate-500 text-xs">
          No stats data compiled.
        </div>
      )}
    </PageContainer>
  );
}

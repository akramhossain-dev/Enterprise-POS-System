'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccounts, useArchiveAccount } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AccountTree } from '@/components/accounting/account-tree';
import { BalanceBadge } from '@/components/accounting/balance-badge';
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  FolderLock,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ListCollapse,
  Eye,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';

export default function POSChartAccountsPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'TREE' | 'TABLE'>('TREE');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch active accounts
  const { data: accData, isLoading } = useAccounts({
    q: query || undefined,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    status: 'ACTIVE',
    page: currentPage,
    limit: 50,
  });

  const archiveMutation = useArchiveAccount();
  const accounts = accData?.data || [];
  const meta = accData?.meta;

  const handleArchive = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to ARCHIVE this ledger account?');
    if (confirm) {
      try {
        await archiveMutation.mutateAsync(id);
      } catch {}
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (meta && currentPage < meta.totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  return (
    <PageContainer className="text-slate-100 select-none text-left">
      {/* Top action header bar */}
      <div className="mb-4 flex justify-between items-center">
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

        <div className="flex gap-2">
          <Link href="/accounting/accounts/archived">
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-slate-800 bg-[#0c1220] hover:bg-slate-900 text-xs gap-1"
            >
              <FolderLock className="h-4 w-4 text-slate-400" />
              <span>Archived Accounts</span>
            </Button>
          </Link>
          <Link href="/accounting/accounts/new">
            <Button
              size="sm"
              className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Create Account</span>
            </Button>
          </Link>
        </div>
      </div>

      <PageHeader
        title="Chart of Accounts Ledger"
        description="Verify ledger codes, adjust balance classifications, and trace nested asset/liabilities hierarchy trees."
      />

      {/* Filters toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4 mb-6">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search account code or name..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 bg-slate-950 border-slate-800 text-slate-100 text-xs focus-visible:ring-emerald-500 h-9"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0c1220] border border-slate-850 text-slate-300 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[120px]"
          >
            <option value="ALL">All Types</option>
            <option value="ASSETS">Assets</option>
            <option value="LIABILITIES">Liabilities</option>
            <option value="EQUITY">Equity</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        {/* View Mode Swapper */}
        <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-lg shrink-0">
          <Button
            size="sm"
            onClick={() => setViewMode('TREE')}
            className={`h-7 px-3 text-xs rounded-md ${
              viewMode === 'TREE'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListCollapse className="h-3.5 w-3.5 mr-1" />
            <span>Tree View</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setViewMode('TABLE')}
            className={`h-7 px-3 text-xs rounded-md ${
              viewMode === 'TABLE'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5 mr-1" />
            <span>Table View</span>
          </Button>
        </div>
      </div>

      {/* Main accounts content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Querying ledger archive...</div>
        ) : accounts.length > 0 ? (
          viewMode === 'TREE' ? (
            <AccountTree accounts={accounts} onArchive={handleArchive} />
          ) : (
            /* Table View */
            <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-xs sm:text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-855 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-955/35">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Account Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Parent</th>
                    <th className="py-3 px-3 text-right">Balance ($)</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium text-slate-300 font-mono">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-bold text-slate-200">{acc.code}</td>
                      <td className="py-3 px-4 font-sans font-bold text-slate-100">{acc.name}</td>
                      <td className="py-3 px-3 font-sans text-xs text-slate-400">{acc.type}</td>
                      <td className="py-3 px-3 font-sans text-xs text-slate-500">
                        {acc.parentAccountCode
                          ? `${acc.parentAccountCode} (${acc.parentAccountName})`
                          : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-200">
                        ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Link href={`/accounting/accounts/${acc.id}`}>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-slate-500 hover:text-emerald-400"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Link href={`/accounting/accounts/${acc.id}/edit`}>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-slate-500 hover:text-amber-400"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleArchive(acc.id)}
                            className="h-7 w-7 text-slate-500 hover:text-rose-455"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-850 rounded-xl">
            <p className="text-xs">No ledger accounts registered.</p>
          </div>
        )}
      </div>

      {/* Pager */}
      {viewMode === 'TABLE' && meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-900 text-xs text-slate-500 font-mono">
          <p>
            Showing {accounts.length} of {meta.total} accounts
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={handlePrevPage}
              className="h-7 w-7 bg-[#0c1220] border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage >= meta.totalPages}
              onClick={handleNextPage}
              className="h-7 w-7 bg-[#0c1220] border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useReturns } from '@/hooks/use-sales-return';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReturnCard } from '@/components/pos/return-card';
import {
  ArrowLeft,
  Search,
  FolderSync,
  Plus,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from 'lucide-react';

export default function POSReturnsHistoryPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch returns list
  const { data: returnData, isLoading } = useReturns({
    q: query || undefined,
    status: status === 'ALL' ? undefined : status,
    page: currentPage,
    limit: 10,
  });

  const returns = returnData?.data || [];
  const meta = returnData?.meta;

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (meta && currentPage < meta.totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  return (
    <PageContainer className="max-w-6xl mx-auto py-6 text-slate-100 select-none text-left">
      {/* Back navigation */}
      <div className="mb-4 flex justify-between items-center">
        <Link href="/pos">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to POS Terminal</span>
          </Button>
        </Link>

        <div className="flex gap-2">
          <Link href="/pos/returns/dashboard">
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 gap-1"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Metrics</span>
            </Button>
          </Link>
          <Link href="/pos/returns/new">
            <Button
              size="sm"
              className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Return Claim</span>
            </Button>
          </Link>
        </div>
      </div>

      <PageHeader
        title="Sales Return Claims Directory"
        description="Verify returned item details, product conditions logs, and cashier refund statuses."
      />

      {/* Filter widgets */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search claims (RTN, Invoice, customer)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8 bg-slate-950 border-slate-800 text-slate-100 text-xs focus-visible:ring-emerald-500 h-9"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0c1220] border border-slate-850 text-slate-300 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[130px]"
          >
            <option value="ALL">All States</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Claims list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Querying return directory...</div>
        ) : returns.length > 0 ? (
          returns.map((claim) => <ReturnCard key={claim.id} claim={claim} />)
        ) : (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-850 rounded-xl">
            <FolderSync className="h-10 w-10 mb-2 text-slate-800 mx-auto" />
            <p className="text-xs">No active return claims registered.</p>
          </div>
        )}
      </div>

      {/* Paging */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-900 text-xs text-slate-500 font-mono">
          <p>
            Page {meta.page} of {meta.totalPages}
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

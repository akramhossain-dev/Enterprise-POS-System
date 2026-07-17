'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useJournals,
  useApproveJournal,
  usePostJournal,
  useCancelJournal,
} from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/accounting/accounting-skeletons';
import {
  ArrowLeft,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  BadgeCheck,
  Building,
  XCircle,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';

export default function JournalsListPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch journals
  const {
    data: journalData,
    isLoading,
    refetch,
  } = useJournals({
    q: query || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page: currentPage,
    limit: 15,
  });

  const approveMutation = useApproveJournal();
  const postMutation = usePostJournal();
  const cancelMutation = useCancelJournal();

  const journals = journalData?.data || [];
  const meta = journalData?.meta;

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (meta && currentPage < meta.totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  // Calculations for sums
  const calculateTotalDebit = (lines: any[]) => {
    return lines.reduce((sum, l) => sum + (l.debitAmount || 0), 0);
  };

  // Bulk Actions
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    const confirm = window.confirm(`Approve ${selectedIds.length} selected journal entries?`);
    if (confirm) {
      try {
        await Promise.all(selectedIds.map((id) => approveMutation.mutateAsync(id)));
        toast.success('Selected journals approved.');
        setSelectedIds([]);
        void refetch();
      } catch {}
    }
  };

  const handleBulkPost = async () => {
    if (selectedIds.length === 0) return;
    const confirm = window.confirm(
      `Post ${selectedIds.length} selected journal entries directly to General Ledger?`,
    );
    if (confirm) {
      try {
        await Promise.all(selectedIds.map((id) => postMutation.mutateAsync(id)));
        toast.success('Selected journals posted to ledgers.');
        setSelectedIds([]);
        void refetch();
      } catch {}
    }
  };

  const handleBulkCancel = async () => {
    if (selectedIds.length === 0) return;
    const confirm = window.confirm(`Cancel ${selectedIds.length} selected journal entries?`);
    if (confirm) {
      try {
        await Promise.all(selectedIds.map((id) => cancelMutation.mutateAsync(id)));
        toast.success('Selected journals cancelled.');
        setSelectedIds([]);
        void refetch();
      } catch {}
    }
  };

  const handleExport = () => {
    // Generate CSV content
    const headers = [
      'Ref Number',
      'Date',
      'Description',
      'Status',
      'Total Debit/Credit',
      'Created At',
    ];
    const rows = journals.map((j) => [
      j.referenceNumber,
      new Date(j.date).toLocaleDateString(),
      j.description,
      j.status,
      calculateTotalDebit(j.lines),
      new Date(j.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'journals_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Journals sheet exported to CSV.');
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === journals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(journals.map((j) => j.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'APPROVED':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-455 border border-rose-500/20';
      case 'DRAFT':
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
  };

  return (
    <PageContainer className="text-foreground select-none text-left">
      {/* Action header bar */}
      <div className="mb-4 flex justify-between items-center">
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

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="h-8 border-border bg-cardard hover:bg-accent text-xs gap-1"
          >
            <FileDown className="h-4 w-4 text-slate-450" />
            <span>Export CSV</span>
          </Button>
          <Link href="/accounting/journals/new">
            <Button
              size="sm"
              className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Create Entry</span>
            </Button>
          </Link>
        </div>
      </div>

      <PageHeader
        title="Journal Ledger Entries"
        description="Verify ledger adjustments, draft double entry logs, and post balancing entries directly to ledgers."
      />

      {/* Toolbar filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between mt-4 mb-6">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search reference or description..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 bg-muted border-border text-foreground text-xs focus-visible:ring-emerald-500 h-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-cardard border border-border text-foreground rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[120px]"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="APPROVED">Approved</option>
            <option value="POSTED">Posted</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Bulk Actions Panel */}
        {selectedIds.length > 0 && (
          <div className="flex gap-2 bg-muted p-1 border border-border rounded-lg w-full md:w-auto justify-end">
            <span className="text-muted-foreground text-xs font-mono self-center px-2">
              {selectedIds.length} Selected:
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleBulkApprove}
              className="h-7 text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 hover:bg-accent"
            >
              <BadgeCheck className="h-3.5 w-3.5 mr-1" />
              <span>Approve</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleBulkPost}
              className="h-7 text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-355 hover:bg-accent"
            >
              <Building className="h-3.5 w-3.5 mr-1" />
              <span>Post</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleBulkCancel}
              className="h-7 text-[10px] font-bold uppercase tracking-wider text-rose-455 hover:text-rose-400 hover:bg-accent"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              <span>Cancel</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Table view */}
      <div className="space-y-4">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : journals.length > 0 ? (
          <div className="bg-cardard border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-855 text-muted-foreground font-bold uppercase tracking-wider text-[10px] bg-slate-955/35">
                  <th className="py-3 px-4 w-[40px] text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === journals.length && journals.length > 0}
                      onChange={handleSelectAll}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 font-mono">Ref Number</th>
                  <th className="py-3 px-3 font-mono">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-3 text-right font-mono">Entry Amount ($)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium text-muted-foreground font-mono">
                {journals.map((j) => (
                  <tr key={j.id} className="hover:bg-accent/40">
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(j.id)}
                        onChange={() => handleSelectRow(j.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">{j.referenceNumber}</td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {new Date(j.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-sans text-foreground text-left truncate max-w-[220px]">
                      {j.description}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-foreground">
                      $
                      {calculateTotalDebit(j.lines).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor(
                          j.status,
                        )}`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <div className="flex items-center justify-center space-x-1">
                        <Link href={`/accounting/journals/${j.id}`}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-emerald-400"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        {j.status === 'DRAFT' && (
                          <Link href={`/accounting/journals/${j.id}/edit`}>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-amber-400"
                              title="Edit Entry"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <p className="text-xs">No journal ledger entries found.</p>
          </div>
        )}
      </div>

      {/* Paging */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border text-xs text-muted-foreground font-mono">
          <p>
            Showing {journals.length} of {meta.total} journal entries
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={handlePrevPage}
              className="h-7 w-7 bg-cardard border-border text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage >= meta.totalPages}
              onClick={handleNextPage}
              className="h-7 w-7 bg-cardard border-border text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

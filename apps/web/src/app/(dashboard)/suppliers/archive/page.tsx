'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, RefreshCw, Trash2, RotateCcw, Search, X } from 'lucide-react';
import { useSuppliers, useDeleteSupplier, useRestoreSupplier } from '@/hooks/use-supplier';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SupplierAvatar } from '@/components/supplier/supplier-avatar';
import { SupplierDueBadge } from '@/components/supplier/supplier-due-badge';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { SupplierFilterParams } from '@/types/supplier';

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-border/50">
          <div className="w-9 h-9 rounded-xl bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-36 bg-muted rounded" />
            <div className="h-2.5 w-24 bg-muted rounded" />
          </div>
          <div className="h-3 w-28 bg-muted rounded" />
          <div className="h-5 w-20 bg-muted rounded-full" />
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-8 w-20 bg-muted rounded-lg" />
          <div className="h-8 w-8 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function SupplierArchivePage() {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const queryParams: SupplierFilterParams = {
    page,
    limit: 25,
    status: 'ARCHIVED',
    q: debouncedSearch || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };

  const { data, isLoading, isFetching, error, refetch } = useSuppliers(queryParams);
  const restoreSupplier = useRestoreSupplier();
  const deleteSupplier = useDeleteSupplier();

  const suppliers = data?.data ?? [];
  const meta = data?.meta;

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
          <Link href="/suppliers">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Active Suppliers
          </Link>
        </Button>
        <PageHeader
          title="Archived Suppliers"
          description="Suppliers that have been archived — restore or permanently delete them"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search archived suppliers…"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            aria-label="Search archived suppliers"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void refetch()}
          disabled={isFetching}
          aria-label="Refresh"
        >
          <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-destructive mb-3">Failed to load archived suppliers</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/60">
                  {['Supplier', 'Phone', 'Email', 'Due', 'Archived On', 'Actions'].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6}>
                      <TableSkeleton />
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                          No archived suppliers
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Suppliers you archive will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <SupplierAvatar supplier={supplier} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {supplier.companyName}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              #{supplier.supplierCode}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-muted-foreground">{supplier.phone || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-muted-foreground truncate max-w-[160px]">
                          {supplier.email || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <SupplierDueBadge balance={supplier.currentBalance} />
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-muted-foreground">
                          {supplier.deletedAt ? formatDate(supplier.deletedAt) : '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreSupplier.mutate(supplier.id)}
                            disabled={restoreSupplier.isPending}
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            Restore
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              if (confirm('Permanently delete this supplier?')) {
                                deleteSupplier.mutate(supplier.id);
                              }
                            }}
                            disabled={deleteSupplier.isPending}
                            aria-label="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {meta.total} archived supplier{meta.total !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={!meta.hasPrevPage}
              >
                ‹ Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNextPage}
              >
                Next ›
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

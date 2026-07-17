'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  RefreshCw,
  Archive,
  Trash2,
  CheckCircle,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useSuppliers, useDeleteSupplier, useArchiveSupplier } from '@/hooks/use-supplier';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SupplierAvatar } from '@/components/supplier/supplier-avatar';
import { SupplierStatusBadge } from '@/components/supplier/supplier-status-badge';
import { SupplierDueBadge } from '@/components/supplier/supplier-due-badge';
import { formatCurrency, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { SupplierFilterParams, Supplier, SupplierStatus } from '@/types/supplier';

// ── Constants ──────────────────────────────────────────────────

const PAGE_SIZES = [10, 25, 50, 100];

const STATUS_OPTIONS: { value: SupplierStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'companyName:asc', label: 'Company A–Z' },
  { value: 'companyName:desc', label: 'Company Z–A' },
  { value: 'currentBalance:desc', label: 'Highest Due' },
] as const;

// ── Skeleton ───────────────────────────────────────────────────

function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-border/50">
          <div className="w-4 h-4 rounded bg-muted flex-shrink-0" />
          <div className="w-9 h-9 rounded-xl bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-36 bg-muted rounded" />
            <div className="h-2.5 w-24 bg-muted rounded" />
          </div>
          <div className="h-3 w-28 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-5 w-20 bg-muted rounded-full" />
          <div className="w-8 h-8 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

// ── Row ────────────────────────────────────────────────────────

interface RowProps {
  supplier: Supplier;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
}

function SupplierRow({ supplier, isSelected, onSelect }: RowProps) {
  const router = useRouter();

  return (
    <tr
      className={cn(
        'group border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/40',
        isSelected && 'bg-primary/5',
      )}
      onClick={() => router.push(`/suppliers/${supplier.id}`)}
    >
      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(supplier.id, e.target.checked)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2 focus:ring-offset-0 cursor-pointer"
          aria-label={`Select ${supplier.companyName}`}
        />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <SupplierAvatar supplier={supplier} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {supplier.companyName}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              #{supplier.supplierCode}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm text-foreground">{supplier.contactPerson || '—'}</p>
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
        <p className="text-sm text-muted-foreground">
          {supplier.addresses?.find((a) => a.isDefault)?.country ??
            supplier.addresses?.[0]?.country ??
            '—'}
        </p>
      </td>
      <td className="px-4 py-3.5 text-right">
        <span className="text-sm font-medium text-muted-foreground">—</span>
      </td>
      <td className="px-4 py-3.5 text-right">
        <span className="text-sm font-medium text-muted-foreground">—</span>
      </td>
      <td className="px-4 py-3.5 text-right">
        <SupplierDueBadge balance={supplier.currentBalance} />
      </td>
      <td className="px-4 py-3.5">
        <SupplierStatusBadge status={supplier.status} />
      </td>
      <td className="px-4 py-3.5">
        <p className="text-xs text-muted-foreground">{formatDate(supplier.createdAt)}</p>
      </td>
      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/suppliers/${supplier.id}/edit`} aria-label="Edit supplier">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ── Main Page ──────────────────────────────────────────────────

export default function SuppliersPage() {
  const router = useRouter();

  const [filters, setFilters] = React.useState<SupplierFilterParams>({
    page: 1,
    limit: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = React.useState(false);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const queryParams: SupplierFilterParams = {
    ...filters,
    q: debouncedSearch || undefined,
  };

  const { data, isLoading, isFetching, error, refetch } = useSuppliers(queryParams);
  const deleteSupplier = useDeleteSupplier();
  const archiveSupplier = useArchiveSupplier();

  const suppliers = data?.data ?? [];
  const meta = data?.meta;

  // ── Selection logic ────────────────────────────────────────

  const allSelected = suppliers.length > 0 && suppliers.every((s) => selectedIds.has(s.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(suppliers.map((s) => s.id)));
    }
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // ── Bulk actions ───────────────────────────────────────────

  const handleBulkArchive = async () => {
    for (const id of selectedIds) {
      await archiveSupplier.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} supplier(s)? This cannot be undone.`)) return;
    for (const id of selectedIds) {
      await deleteSupplier.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  // ── Pagination helpers ─────────────────────────────────────

  const setPage = (page: number) => setFilters((f) => ({ ...f, page }));

  const setSortOption = (opt: string) => {
    const [sortBy, sortOrder] = opt.split(':') as [
      SupplierFilterParams['sortBy'],
      SupplierFilterParams['sortOrder'],
    ];
    setFilters((f) => ({ ...f, sortBy, sortOrder, page: 1 }));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Suppliers"
        description="Manage your supplier relationships and purchase history"
        actions={
          <>
            <Link href="/suppliers/archive">
              <Button variant="outline" size="sm">
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            </Link>
            <Link href="/suppliers/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Supplier
              </Button>
            </Link>
          </>
        }
      />

      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFilters((f) => ({ ...f, page: 1 }));
              }}
              placeholder="Search suppliers…"
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              aria-label="Search suppliers"
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

          {/* Filter toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((s) => !s)}
            className={cn(showFilters && 'border-primary text-primary')}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {(filters.status || filters.dateFrom) && (
              <Badge
                variant="default"
                className="ml-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                !
              </Badge>
            )}
          </Button>

          {/* Sort */}
          <select
            value={`${filters.sortBy}:${filters.sortOrder}`}
            onChange={(e) => setSortOption(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Page size */}
          <select
            value={filters.limit}
            onChange={(e) => setFilters((f) => ({ ...f, limit: Number(e.target.value), page: 1 }))}
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            aria-label="Rows per page"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>

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

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={filters.status ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: (e.target.value as SupplierStatus) || undefined,
                    page: 1,
                  }))
                }
                className="h-7 px-2 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">From</label>
              <input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined, page: 1 }))
                }
                className="h-7 px-2 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">To</label>
              <input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, dateTo: e.target.value || undefined, page: 1 }))
                }
                className="h-7 px-2 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setFilters({ page: 1, limit: 25, sortBy: 'createdAt', sortOrder: 'desc' });
                setSearch('');
              }}
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
            <span className="text-sm font-medium text-primary">{selectedIds.size} selected</span>
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkArchive}
                disabled={archiveSupplier.isPending}
              >
                <Archive className="w-4 h-4 mr-1.5" />
                Archive
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleteSupplier.isPending}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                <X className="w-4 h-4 mr-1.5" />
                Deselect
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-cardard overflow-hidden">
        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="text-sm font-medium text-destructive mb-2">Failed to load suppliers</p>
            <p className="text-xs text-muted-foreground mb-4">
              {(error as any)?.message ?? 'An unexpected error occurred'}
            </p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* Table */}
        {!error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-muted/60 backdrop-blur-sm">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                      aria-label="Select all"
                    />
                  </th>
                  {[
                    'Supplier',
                    'Contact Person',
                    'Phone',
                    'Email',
                    'Country',
                    'Total Purchase',
                    'Total Paid',
                    'Due',
                    'Status',
                    'Created',
                    '',
                  ].map((col, i) => (
                    <th
                      key={i}
                      className={cn(
                        'px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap',
                        (i === 5 || i === 6 || i === 7) && 'text-right',
                      )}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={12}>
                      <TableSkeleton />
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={12}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <CheckCircle className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                          {debouncedSearch ? 'No suppliers found' : 'No suppliers yet'}
                        </p>
                        {!debouncedSearch && (
                          <Link href="/suppliers/new">
                            <Button size="sm" className="mt-4">
                              <Plus className="w-4 h-4 mr-2" />
                              Add your first supplier
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <SupplierRow
                      key={supplier.id}
                      supplier={supplier}
                      isSelected={selectedIds.has(supplier.id)}
                      onSelect={toggleOne}
                    />
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
              Showing{' '}
              <span className="font-medium text-foreground">
                {(meta.page - 1) * meta.pageSize + 1}–
                {Math.min(meta.page * meta.pageSize, meta.total)}
              </span>{' '}
              of <span className="font-medium text-foreground">{meta.total}</span> suppliers
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(meta.page - 1)}
                disabled={!meta.hasPrevPage}
              >
                ‹ Prev
              </Button>
              {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={meta.page === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(page)}
                    className="w-8"
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(meta.page + 1)}
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

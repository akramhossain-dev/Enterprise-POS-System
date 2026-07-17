'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Warehouse as WarehouseIcon,
  FileDown,
  Printer,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useTransfers, useApproveTransfer, useRejectTransfer } from '@/hooks/use-operations';
import { useWarehouses } from '@/hooks/use-warehouse';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { DataTable } from '@/components/data-table/data-table';
import { ApprovalBadge } from '@/components/operations/approval-badge';
import type { ColumnDef } from '@tanstack/react-table';
import type { StockTransfer, TransferStatus } from '@/types/inventory';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export default function StockTransfersPage() {
  const [q, setQ] = React.useState('');
  const [fromWarehouseFilter, setFromWarehouseFilter] = React.useState('');
  const [toWarehouseFilter, setToWarehouseFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<TransferStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [showFilters, setShowFilters] = React.useState(false);

  // Bulk actions selection
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = useTransfers({
    page,
    limit: pageSize,
    q: q || undefined,
    fromWarehouseId: fromWarehouseFilter || undefined,
    toWarehouseId: toWarehouseFilter || undefined,
    status: statusFilter,
  });

  const approveMutation = useApproveTransfer();
  const rejectMutation = useRejectTransfer();

  const transfers = response?.data || [];
  const totalCount = response?.meta?.total ?? 0;

  const handleExport = () => {
    toast.info('Exporting stock transfer directory (UI Only)...');
  };

  const handlePrintSlips = () => {
    if (selectedIds.length === 0) {
      toast.warning('Please select at least one transfer to print.');
      return;
    }
    toast.info(`Printing transfer slips for ${selectedIds.length} items...`);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    toast.promise(Promise.all(selectedIds.map((id) => approveMutation.mutateAsync(id))), {
      loading: 'Approving selected transfers...',
      success: () => {
        setSelectedIds([]);
        void refetch();
        return 'Selected transfers approved';
      },
      error: 'Failed to approve some transfers',
    });
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    toast.promise(Promise.all(selectedIds.map((id) => rejectMutation.mutateAsync(id))), {
      loading: 'Rejecting selected transfers...',
      success: () => {
        setSelectedIds([]);
        void refetch();
        return 'Selected transfers rejected';
      },
      error: 'Failed to reject some transfers',
    });
  };

  const columns: ColumnDef<StockTransfer>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(transfers.map((t) => t.id));
            } else {
              setSelectedIds([]);
            }
          }}
          checked={selectedIds.length === transfers.length && transfers.length > 0}
          className="rounded border-border bg-card"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.original.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds((prev) => [...prev, row.original.id]);
            } else {
              setSelectedIds((prev) => prev.filter((id) => id !== row.original.id));
            }
          }}
          className="rounded border-border bg-card"
        />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Request Date',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      id: 'referenceNumber',
      header: 'Reference ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold bg-muted px-1.5 py-0.5 rounded text-foreground">
          {row.original.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      id: 'fromWarehouse',
      header: 'Source Depot',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
          <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
          {row.original.fromWarehouse?.name || '—'}
        </div>
      ),
    },
    {
      id: 'toWarehouse',
      header: 'Destination Depot',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
          <WarehouseIcon className="w-3.5 h-3.5 text-primary" />
          {row.original.toWarehouse?.name || '—'}
        </div>
      ),
    },
    {
      id: 'itemCount',
      header: 'Items Registered',
      cell: ({ row }) => (
        <span className="text-xs font-semibold">{row.original.items?.length ?? 0} SKUs</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Transit Status',
      cell: ({ row }) => <ApprovalBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link href={`/inventory/transfers/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details & timeline">
            <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/inventory">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            &larr; Back to Dashboard
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Stock Transfers Directory"
        description="Initiate, monitor, and finalize catalog transfers between warehouse depots and retail store branches."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <FileDown className="w-4 h-4" /> Export
            </Button>
            <Link href="/inventory/transfers/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> Initiate Transfer
              </Button>
            </Link>
          </div>
        }
      />

      {/* Bulk actions and filters */}
      <div className="bg-card border rounded-xl p-4 mb-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reference ID or remarks..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-muted/20 border-border"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1.5 border-r pr-3 mr-1 border-border">
                <span className="text-xs text-muted-foreground font-semibold mr-1">
                  {selectedIds.length} Selected:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintSlips}
                  className="gap-1.5 h-8"
                >
                  <Printer className="w-3.5 h-3.5" /> Slip
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkApprove}
                  className="text-emerald-500 hover:bg-emerald-500/5 gap-1.5 h-8"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkReject}
                  className="text-rose-500 hover:bg-rose-500/5 gap-1.5 h-8"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn('gap-1.5', showFilters && 'bg-muted')}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {(fromWarehouseFilter || toWarehouseFilter || statusFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
            {(q || fromWarehouseFilter || toWarehouseFilter || statusFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-9"
                onClick={() => {
                  setQ('');
                  setFromWarehouseFilter('');
                  setToWarehouseFilter('');
                  setStatusFilter('ALL');
                }}
              >
                Clear all
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Source Warehouse */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Source Depot
              </label>
              <select
                value={fromWarehouseFilter}
                onChange={(e) => {
                  setFromWarehouseFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none"
              >
                <option value="">All Source Depots</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Warehouse */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Destination Depot
              </label>
              <select
                value={toWarehouseFilter}
                onChange={(e) => {
                  setToWarehouseFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none"
              >
                <option value="">All Destination Depots</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Transfer Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid list */}
      {isLoading ? (
        <TableSkeleton columns={8} rows={pageSize} />
      ) : (
        <div className="bg-card border rounded-xl shadow-sm p-4">
          <DataTable
            columns={columns}
            data={transfers}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyTitle="No stock transfers found"
            emptyDescription="Initiate transfers between warehouses to track inventory in transit."
          />
        </div>
      )}
    </PageContainer>
  );
}

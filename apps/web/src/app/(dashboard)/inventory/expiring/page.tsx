'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar, FileDown, RefreshCw, Search, Warehouse as WarehouseIcon } from 'lucide-react';
import { useBatches, useExpireOldBatches } from '@/hooks/use-inventory';
import { useWarehouses } from '@/hooks/use-warehouse';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { ExpiryBadge } from '@/components/inventory/expiry-badge';
import { DataTable } from '@/components/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { Batch } from '@/types/inventory';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

export default function ExpiringProductsPage() {
  const [q, setQ] = React.useState('');
  const [warehouseFilter, setWarehouseFilter] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const {
    data: batchesResponse,
    isLoading,
    refetch,
    isFetching,
  } = useBatches({
    page,
    limit: pageSize,
    q: q || undefined,
    warehouseId: warehouseFilter || undefined,
    expiryStatus: 'EXPIRING_SOON', // Fetch batches that are expiring soon or expired
  });

  const batches = batchesResponse?.data || [];
  const totalCount = batchesResponse?.meta?.total ?? 0;

  const expireMutation = useExpireOldBatches();

  const handleRunExpiryJob = async () => {
    try {
      await expireMutation.mutateAsync();
      void refetch();
    } catch {}
  };

  const handleExport = () => {
    toast.info('Exporting expiry ledger reports (UI Only)...');
  };

  const columns: ColumnDef<Batch>[] = [
    {
      id: 'product',
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.original.product?.name || '—'}</span>
          <span className="text-xs text-muted-foreground">
            SKU: {row.original.product?.sku || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'batchNumber',
      header: 'Batch Number',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded text-foreground">
          {row.original.batchNumber}
        </span>
      ),
    },
    {
      id: 'warehouse',
      header: 'Warehouse',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs">
          <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
          {row.original.warehouse?.name || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Batch Qty',
      cell: ({ row }) => Number(row.original.quantity).toFixed(2),
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
      cell: ({ row }) => {
        const d = row.original.expiryDate;
        return d ? new Date(d).toLocaleDateString() : '—';
      },
    },
    {
      id: 'remainingDays',
      header: 'Time Remaining',
      cell: ({ row }) => <ExpiryBadge expiryDate={row.original.expiryDate} />,
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
        title="Shelf Life & Expiry Controls"
        description="Oversee perishable products, filter batches nearing expiration timelines, and trigger system-wide quarantine flags."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <FileDown className="w-4 h-4" /> Expiry Export
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleRunExpiryJob}
              disabled={expireMutation.isPending}
              className="gap-1.5"
            >
              <RefreshCw className={cn('w-4 h-4', expireMutation.isPending && 'animate-spin')} />
              Run Expiry Check Job
            </Button>
          </div>
        }
      />

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-cardard border rounded-xl p-4 mb-6 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search batches..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-muted/20 border-border"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <WarehouseIcon className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <select
            value={warehouseFilter}
            onChange={(e) => {
              setWarehouseFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main expiring stock lists */}
      {isLoading ? (
        <TableSkeleton columns={6} rows={pageSize} />
      ) : (
        <div className="bg-cardard border rounded-xl shadow-sm p-4">
          <div className="mb-4 flex items-center gap-2 text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-xs font-medium">
            <Calendar className="w-4 h-4 flex-shrink-0 animate-pulse" />
            <span>
              Currently: {totalCount} active batches are expired or expiring soon (within 30 days).
              Secure or quarantine immediately.
            </span>
          </div>

          <DataTable
            columns={columns}
            data={batches}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyTitle="No expiring batches"
            emptyDescription="Perishable tracking logs are empty or all batches are safe."
          />
        </div>
      )}
    </PageContainer>
  );
}

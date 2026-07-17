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
} from 'lucide-react';
import { useAdjustments } from '@/hooks/use-operations';
import { useWarehouses } from '@/hooks/use-warehouse';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { DataTable } from '@/components/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { StockAdjustment, AdjustmentType } from '@/types/inventory';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export default function StockAdjustmentsPage() {
  const [q, setQ] = React.useState('');
  const [warehouseFilter, setWarehouseFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<AdjustmentType | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [showFilters, setShowFilters] = React.useState(false);

  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = useAdjustments({
    page,
    limit: pageSize,
    q: q || undefined,
    warehouseId: warehouseFilter || undefined,
    type: typeFilter,
  });

  const adjustments = response?.data || [];
  const totalCount = response?.meta?.total ?? 0;

  const handleExport = () => {
    toast.info('Exporting adjustments directory (UI Only)...');
  };

  const columns: ColumnDef<StockAdjustment>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Adjustment Date',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      id: 'product',
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">
            {row.original.product?.name || '—'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            SKU: {row.original.product?.sku || 'N/A'}
          </span>
        </div>
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
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const t = row.original.type;
        return (
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border',
              t === 'INCREASE' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
              t === 'DECREASE' && 'bg-rose-500/10 text-rose-500 border-rose-500/20',
              t === 'DAMAGE' && 'bg-amber-500/10 text-amber-500 border-amber-500/20',
              t === 'EXPIRED' && 'bg-rose-500/10 text-rose-500 border-rose-500/20',
              t === 'LOST' && 'bg-rose-500/10 text-rose-500 border-rose-500/20',
            )}
          >
            {t}
          </span>
        );
      },
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity Delta',
      cell: ({ row }) => {
        const qty = Number(row.original.quantity);
        const isAdd = row.original.type === 'INCREASE';
        return (
          <span className={cn('font-bold', isAdd ? 'text-emerald-500' : 'text-rose-500')}>
            {isAdd ? '+' : '-'}
            {qty.toFixed(2)}
          </span>
        );
      },
    },
    {
      accessorKey: 'reason',
      header: 'Reason Given',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-medium">{row.original.reason}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link href={`/inventory/adjustments/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
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
        title="Stock Adjustments Directory"
        description="Oversee, create, and audit stock corrections, manual increases/decreases, and initial warehouse opening balances."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <FileDown className="w-4 h-4" /> Export Adjustments
            </Button>
            <Link href="/inventory/adjustments/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> New Adjustment
              </Button>
            </Link>
          </div>
        }
      />

      {/* Toolbar filters */}
      <div className="bg-cardard border rounded-xl p-4 mb-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search SKU or adjustment reason..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-muted/20 border-border"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn('gap-1.5', showFilters && 'bg-muted')}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {(warehouseFilter || typeFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
            {(q || warehouseFilter || typeFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-9"
                onClick={() => {
                  setQ('');
                  setWarehouseFilter('');
                  setTypeFilter('ALL');
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
          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Warehouse */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Warehouse
              </label>
              <select
                value={warehouseFilter}
                onChange={(e) => {
                  setWarehouseFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Adjustment Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Adjustment Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="INCREASE">INCREASE</option>
                <option value="DECREASE">DECREASE</option>
                <option value="DAMAGE">DAMAGE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="LOST">LOST</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid list */}
      {isLoading ? (
        <TableSkeleton columns={7} rows={pageSize} />
      ) : (
        <div className="bg-cardard border rounded-xl shadow-sm p-4">
          <DataTable
            columns={columns}
            data={adjustments}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyTitle="No stock adjustments found"
            emptyDescription="Create stock adjustments to manually override catalog counts."
          />
        </div>
      )}
    </PageContainer>
  );
}

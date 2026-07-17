'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  History,
  FileDown,
  RefreshCw,
  Search,
  Warehouse as WarehouseIcon,
  Filter,
} from 'lucide-react';
import { useInventoryLedger } from '@/hooks/use-inventory';
import { useWarehouses } from '@/hooks/use-warehouse';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { StockTimeline } from '@/components/inventory/stock-timeline';
import { DataTable } from '@/components/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { InventoryLedger, MovementType } from '@/types/inventory';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

export default function StockHistoryPage() {
  const [q, setQ] = React.useState('');
  const [warehouseFilter, setWarehouseFilter] = React.useState('');
  const [movementTypeFilter, setMovementTypeFilter] = React.useState<MovementType | 'ALL'>('ALL');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [viewMode, setViewMode] = React.useState<'table' | 'timeline'>('timeline');

  // Queries
  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const {
    data: ledgerResponse,
    isLoading,
    refetch,
    isFetching,
  } = useInventoryLedger({
    page,
    limit: pageSize,
    q: q || undefined,
    warehouseId: warehouseFilter || undefined,
    movementType: movementTypeFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const movements = ledgerResponse?.data || [];
  const totalCount = ledgerResponse?.meta?.total ?? 0;

  const handleExport = () => {
    toast.info('Exporting transaction history ledger logs (UI Only)...');
  };

  const columns: ColumnDef<InventoryLedger>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Date & Time',
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
      cell: ({ row }) => row.original.warehouse?.name || '—',
    },
    {
      id: 'movementType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.movement?.movementType;
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-muted text-foreground uppercase border border-border">
            {type}
          </span>
        );
      },
    },
    {
      id: 'quantity',
      header: 'Quantity Delta',
      cell: ({ row }) => {
        const movement = row.original.movement;
        if (!movement) return '0.00';
        const qty = Number(movement.quantity);
        const isOut = [
          'SALE',
          'PURCHASE_RETURN',
          'TRANSFER_OUT',
          'ADJUSTMENT_OUT',
          'DAMAGE',
          'EXPIRED',
          'LOST',
        ].includes(movement.movementType);
        return (
          <span className={isOut ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
            {isOut ? '-' : '+'}
            {qty.toFixed(2)}
          </span>
        );
      },
    },
    {
      accessorKey: 'runningQuantity',
      header: 'Resulting Stock Balance',
      cell: ({ row }) => Number(row.original.runningQuantity).toFixed(2),
    },
    {
      id: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground italic truncate max-w-[200px] block">
          {row.original.movement?.remarks || '—'}
        </span>
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
        title="Stock Activity Ledger"
        description="Verify comprehensive stock flow history. Filters allow trace-checks on specific sales (Foundation) or adjustments (Read Only)."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <FileDown className="w-4 h-4" /> Export Ledger
            </Button>
            <div className="border rounded-lg p-0.5 bg-muted/30 flex">
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 text-xs font-semibold px-3"
                onClick={() => setViewMode('timeline')}
              >
                Timeline View
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 text-xs font-semibold px-3"
                onClick={() => setViewMode('table')}
              >
                Table Grid
              </Button>
            </div>
          </div>
        }
      />

      {/* Advanced search, filter, and dates toolbar */}
      <div className="bg-cardard border rounded-xl p-4 mb-6 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 items-end">
          {/* Search product */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Search SKU / Product
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Product SKU / Name..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                className="pl-8 text-xs bg-muted/20 border-border"
              />
            </div>
          </div>

          {/* Warehouse filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Warehouse
            </label>
            <select
              value={warehouseFilter}
              onChange={(e) => {
                setWarehouseFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-9"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Movement Type filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Movement Type
            </label>
            <select
              value={movementTypeFilter}
              onChange={(e) => {
                setMovementTypeFilter(e.target.value as any);
                setPage(1);
              }}
              className="w-full text-xs rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-9"
            >
              <option value="ALL">All Types</option>
              <option value="OPENING_STOCK">Opening Stock</option>
              <option value="PURCHASE">Purchase Stock-In</option>
              <option value="SALE">Sale Stock-Out</option>
              <option value="TRANSFER_IN">Transfer In</option>
              <option value="TRANSFER_OUT">Transfer Out</option>
              <option value="ADJUSTMENT_IN">Adjustment (+)</option>
              <option value="ADJUSTMENT_OUT">Adjustment (-)</option>
              <option value="DAMAGE">Damage Block</option>
              <option value="EXPIRED">Expired Batch</option>
              <option value="LOST">Lost Stock</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-muted/20 border-border h-9"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-muted/20 border-border h-9"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-2 border-border/50">
          {(q || warehouseFilter || movementTypeFilter !== 'ALL' || startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 text-muted-foreground"
              onClick={() => {
                setQ('');
                setWarehouseFilter('');
                setMovementTypeFilter('ALL');
                setStartDate('');
                setEndDate('');
              }}
            >
              Clear filters
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="h-8 px-2"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Primary Display */}
      {isLoading ? (
        viewMode === 'table' ? (
          <TableSkeleton columns={7} rows={pageSize} />
        ) : (
          <div className="bg-cardard border rounded-xl shadow-sm p-6">
            <div className="animate-pulse space-y-6 pl-6 ml-3 border-l border-border relative">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-10 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        )
      ) : viewMode === 'table' ? (
        <div className="bg-cardard border rounded-xl shadow-sm p-4">
          <DataTable
            columns={columns}
            data={movements}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyTitle="No ledger transactions found"
            emptyDescription="Record operations or check stock values to trigger automated logs."
          />
        </div>
      ) : (
        <div className="bg-cardard border rounded-xl shadow-sm p-6">
          <StockTimeline movements={movements} />
          {movements.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No ledger transactions found.</p>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}

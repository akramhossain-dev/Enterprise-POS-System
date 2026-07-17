'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Eye,
  FileDown,
  RefreshCw,
  Search,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import { useInventoryList } from '@/hooks/use-inventory';
import { useWarehouses } from '@/hooks/use-warehouse';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { DataTable } from '@/components/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { Inventory } from '@/types/inventory';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

export default function LowStockPage() {
  const [q, setQ] = React.useState('');
  const [warehouseFilter, setWarehouseFilter] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const {
    data: inventoryResponse,
    isLoading,
    refetch,
    isFetching,
  } = useInventoryList({
    page,
    limit: pageSize,
    q: q || undefined,
    warehouseId: warehouseFilter || undefined,
    stockStatus: 'LOW_STOCK',
  });

  const inventories = inventoryResponse?.data || [];
  const totalCount = inventoryResponse?.meta?.total ?? 0;

  const handleExport = () => {
    toast.info('Exporting low stock alerts (UI Only)...');
  };

  const columns: ColumnDef<Inventory>[] = [
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
      id: 'warehouse',
      header: 'Warehouse',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
          {row.original.warehouse?.name || '—'}
        </div>
      ),
    },
    {
      id: 'currentQuantity',
      header: 'Current Stock',
      cell: ({ row }) => {
        const item = row.original;
        const total = Number(item.availableQuantity) + Number(item.reservedQuantity);
        return <span className="text-amber-500 font-bold">{total.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: 'minimumQuantity',
      header: 'Minimum Threshold',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {Number(row.original.minimumQuantity).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'reorderQuantity',
      header: 'Reorder Level Point',
      cell: ({ row }) => Number(row.original.reorderQuantity).toFixed(2),
    },
    {
      id: 'supplier',
      header: 'Supplier Context',
      cell: ({ row }) => {
        // Foundation supplier metadata pointer
        return <span className="text-xs text-muted-foreground">System Linked Supplier</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link href={`/inventory/${row.original.id}`}>
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
        title="Low Stock Watchlist"
        description="Monitor product items that are currently running below safety stock minimums. Restock immediately to avoid sale blockages."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <FileDown className="w-4 h-4" /> Export Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            </Button>
          </div>
        }
      />

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-cardard border rounded-xl p-4 mb-6 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stock..."
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

      {/* Low Stock master list */}
      {isLoading ? (
        <TableSkeleton columns={7} rows={pageSize} />
      ) : (
        <div className="bg-cardard border rounded-xl shadow-sm p-4">
          <div className="mb-4 flex items-center gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              Currently: {totalCount} items are running below minimum safety levels. Restocking
              orders are recommended.
            </span>
          </div>

          <DataTable
            columns={columns}
            data={inventories}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyTitle="Safety levels clear"
            emptyDescription="All products are well within safety bounds."
          />
        </div>
      )}
    </PageContainer>
  );
}

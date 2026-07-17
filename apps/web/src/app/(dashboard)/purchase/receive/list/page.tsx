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
  Truck,
} from 'lucide-react';
import { useGRNs } from '@/hooks/use-goods-receive';
import { useWarehouses } from '@/hooks/use-warehouse';
import { useSuppliers } from '@/hooks/use-supplier';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/purchase/status-badge';
import type { ColumnDef } from '@tanstack/react-table';
import type { GoodsReceive, GoodsReceiveStatus } from '@/types/goods-receive';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export default function GoodsReceiveListPage() {
  const [q, setQ] = React.useState('');
  const [warehouseFilter, setWarehouseFilter] = React.useState('');
  const [supplierFilter, setSupplierFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<GoodsReceiveStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [showFilters, setShowFilters] = React.useState(false);

  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const { data: suppliersResponse } = useSuppliers({ page: 1, limit: 100 });
  const suppliers = suppliersResponse?.data || [];

  // Query GRN list
  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = useGRNs({
    page,
    limit: pageSize,
    search: q || undefined,
    warehouseId: warehouseFilter || undefined,
    supplierId: supplierFilter || undefined,
    status: statusFilter,
  });

  const grns = response?.data || [];
  const totalCount = response?.meta?.total ?? 0;

  // Show only active DRAFT receiving logs on this primary list and refer to /purchase/receive/history for completed ones
  const activeGRNs = React.useMemo(() => {
    return grns.filter((g) => g.status === 'DRAFT');
  }, [grns]);

  const handleExport = () => {
    toast.info('Exporting active receiving logs directory (UI Only)...');
  };

  const columns: ColumnDef<GoodsReceive>[] = [
    {
      accessorKey: 'receiveDate',
      header: 'Arrival Date',
      cell: ({ row }) => new Date(row.original.receiveDate).toLocaleString(),
    },
    {
      accessorKey: 'grnNumber',
      header: 'GRN Number',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold bg-muted px-1.5 py-0.5 rounded text-foreground">
          {row.original.grnNumber}
        </span>
      ),
    },
    {
      id: 'purchaseOrder',
      header: 'Purchase Order',
      cell: ({ row }) =>
        row.original.purchaseOrder ? (
          <Link
            href={`/purchase/orders/${row.original.purchaseOrderId}`}
            className="font-mono font-bold text-primary hover:underline"
          >
            {row.original.purchaseOrder.purchaseOrderNumber}
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: 'supplier',
      header: 'Supplier Vendor',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.supplier?.companyName || '—'}
        </span>
      ),
    },
    {
      id: 'warehouse',
      header: 'Target Warehouse',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
          <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
          {row.original.warehouse?.name || '—'}
        </div>
      ),
    },
    {
      id: 'items',
      header: 'Items Count',
      cell: ({ row }) => (
        <span className="text-xs font-semibold">{row.original.items?.length ?? 0} items</span>
      ),
    },
    {
      accessorKey: 'grandTotal',
      header: 'Total Cost',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          ${Number(row.original.grandTotal || row.original.subtotal).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Audit Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link href={`/purchase/receive/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
            <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <PageContainer>
      <div className="mb-4 flex justify-between items-center">
        <Link href="/purchase/receive">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            &larr; Back to Dashboard
          </Button>
        </Link>
        <Link href="/purchase/receive/history">
          <Button variant="outline" size="sm" className="text-xs font-semibold">
            View Receiving History &rarr;
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Active Receiving Logs (GRNs)"
        description="Verify and adjust draft Goods Receive Notes. Committing a GRN adds products physically to the warehouse stock ledger."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <FileDown className="w-4 h-4" /> Export GRNs
            </Button>
            <Link href="/purchase/receive/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> Receive PO
              </Button>
            </Link>
          </div>
        }
      />

      {/* Toolbar filters */}
      <div className="bg-cardard border rounded-xl p-4 mb-6 shadow-sm space-y-4 text-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search GRN number or supplier..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-muted/20 border-border"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn('gap-1.5', showFilters && 'bg-muted')}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {(warehouseFilter || supplierFilter || statusFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
            {(q || warehouseFilter || supplierFilter || statusFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-9"
                onClick={() => {
                  setQ('');
                  setWarehouseFilter('');
                  setSupplierFilter('');
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
            {/* Warehouse */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Target Warehouse
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

            {/* Supplier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Supplier Vendor
              </label>
              <select
                value={supplierFilter}
                onChange={(e) => {
                  setSupplierFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Receiving Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
              >
                <option value="ALL">All Active Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid list */}
      {isLoading ? (
        <TableSkeleton columns={9} rows={pageSize} />
      ) : (
        <div className="bg-cardard border rounded-xl shadow-sm p-4">
          <DataTable
            columns={columns}
            data={activeGRNs}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyTitle="No active receiving notes found"
            emptyDescription="Finished receiving logs can be audited under receiving history."
          />
        </div>
      )}
    </PageContainer>
  );
}

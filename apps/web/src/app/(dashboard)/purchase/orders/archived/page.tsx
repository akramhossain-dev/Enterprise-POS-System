'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  RefreshCw,
  Search,
  Eye,
  Warehouse as WarehouseIcon,
  FileDown,
  Building,
  ArrowLeft,
} from 'lucide-react';
import { usePurchaseOrders } from '@/hooks/use-purchase';
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
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchase';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export default function ArchivedPurchaseOrdersPage() {
  const [q, setQ] = React.useState('');
  const [warehouseFilter, setWarehouseFilter] = React.useState('');
  const [supplierFilter, setSupplierFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<
    'RECEIVED' | 'CANCELLED' | 'COMPLETED' | 'ALL'
  >('ALL');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [showFilters, setShowFilters] = React.useState(false);

  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const { data: suppliersResponse } = useSuppliers({ page: 1, limit: 100 });
  const suppliers = suppliersResponse?.data || [];

  // Query orders
  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = usePurchaseOrders({
    page,
    limit: pageSize,
    q: q || undefined,
    warehouseId: warehouseFilter || undefined,
    supplierId: supplierFilter || undefined,
    // If status filter is ALL, let use-purchase handle it and we filter client-side for archived states
  });

  const orders = response?.data || [];
  const totalCount = response?.meta?.total ?? 0;

  // Filter client-side to ONLY show RECEIVED, CANCELLED, and COMPLETED
  const archivedOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = ['RECEIVED', 'CANCELLED', 'COMPLETED'].includes(o.status.toUpperCase());
      if (!matchStatus) return false;

      if (statusFilter !== 'ALL') {
        return o.status.toUpperCase() === statusFilter;
      }
      return true;
    });
  }, [orders, statusFilter]);

  const handleExport = () => {
    toast.info('Exporting archived purchase orders directory (UI Only)...');
  };

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Order Date',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: 'purchaseOrderNumber',
      header: 'PO Number',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold bg-muted px-1.5 py-0.5 rounded text-foreground">
          {row.original.purchaseOrderNumber}
        </span>
      ),
    },
    {
      id: 'supplier',
      header: 'Supplier Vendor',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
          <Building className="w-3.5 h-3.5 text-muted-foreground" />
          {row.original.supplier?.companyName || '—'}
        </div>
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
      id: 'itemCount',
      header: 'Items Listed',
      cell: ({ row }) => (
        <span className="text-xs font-semibold">{row.original.items?.length ?? 0} SKUs</span>
      ),
    },
    {
      accessorKey: 'grandTotal',
      header: 'Total Spend',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          ${Number(row.original.grandTotal || row.original.subtotal).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Transit Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link href={`/purchase/orders/${row.original.id}`}>
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
        <Link href="/purchase/orders">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Active Orders
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Archived Purchase Orders"
        description="View past vendor transactions, finished receipts, and aborted purchase orders."
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <FileDown className="w-4 h-4" /> Export Archive
          </Button>
        }
      />

      {/* Toolbar filters */}
      <div className="bg-cardard border rounded-xl p-4 mb-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search PO number or supplier..."
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
                Archive Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
              >
                <option value="ALL">All Archived Statuses</option>
                <option value="RECEIVED">RECEIVED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid list */}
      {isLoading ? (
        <TableSkeleton columns={8} rows={pageSize} />
      ) : (
        <div className="bg-cardard border rounded-xl shadow-sm p-4">
          <DataTable
            columns={columns}
            data={archivedOrders}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyTitle="No archived purchase orders found"
            emptyDescription="Finished, fully received, and cancelled orders will be archived here."
          />
        </div>
      )}
    </PageContainer>
  );
}

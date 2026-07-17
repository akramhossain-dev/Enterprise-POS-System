'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  RefreshCw,
  Search,
  Eye,
  FileSpreadsheet,
  FileDown,
  Building,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { useSupplierInvoices } from '@/hooks/use-goods-receive';
import { useSuppliers } from '@/hooks/use-supplier';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/purchase/status-badge';
import type { ColumnDef } from '@tanstack/react-table';
import type { SupplierInvoice, SupplierInvoiceStatus } from '@/types/goods-receive';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export default function SupplierInvoicesPage() {
  const [q, setQ] = React.useState('');
  const [supplierFilter, setSupplierFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<SupplierInvoiceStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [showFilters, setShowFilters] = React.useState(false);

  const { data: suppliersResponse } = useSuppliers({ page: 1, limit: 100 });
  const suppliers = suppliersResponse?.data || [];

  // Query Invoices list
  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = useSupplierInvoices({
    page,
    limit: pageSize,
    invoiceNumber: q || undefined,
    supplierId: supplierFilter || undefined,
    status: statusFilter,
  });

  const invoices = response?.data || [];
  const totalCount = response?.meta?.total ?? 0;

  const handleExport = () => {
    toast.info('Exporting supplier invoices directory (UI Only)...');
  };

  const columns: ColumnDef<SupplierInvoice>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Invoice Date',
      cell: ({ row }) =>
        new Date(row.original.invoiceDate || row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice Number',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold bg-muted px-1.5 py-0.5 rounded text-foreground">
          {row.original.invoiceNumber}
        </span>
      ),
    },
    {
      id: 'goodsReceive',
      header: 'GRN Reference',
      cell: ({ row }) => (
        <Link
          href={`/purchase/receive/${row.original.goodsReceiveId}`}
          className="font-mono font-bold text-primary hover:underline"
        >
          {row.original.goodsReceive?.grnNumber || 'GRN Details'}
        </Link>
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
      accessorKey: 'subtotal',
      header: 'Subtotal',
      cell: ({ row }) => (
        <span className="font-mono">${Number(row.original.subtotal).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'grandTotal',
      header: 'Invoice Total',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          ${Number(row.original.grandTotal).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Invoice Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link href={`/purchase/invoices/${row.original.id}`}>
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
        <Link href="/purchase">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            &larr; Back to Dashboard
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Supplier Invoices Directory"
        description="Oversee corporate accounts payable, verify invoices registered against received stock, and match values."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <FileDown className="w-4 h-4" /> Export Invoices
            </Button>
            <Link href="/purchase/invoices/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> New Invoice
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
              placeholder="Search invoice code..."
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
              {(supplierFilter || statusFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
            {(q || supplierFilter || statusFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-9"
                onClick={() => {
                  setQ('');
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
          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
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
                Invoice Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
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
            data={invoices}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyTitle="No supplier invoices found"
            emptyDescription="Create invoices against completed Goods Receive Notes to commit vendor accounts payable."
          />
        </div>
      )}
    </PageContainer>
  );
}

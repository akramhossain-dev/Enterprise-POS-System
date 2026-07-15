'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Download,
  Printer,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  History,
  LayoutDashboard,
  Calendar,
  Building,
  Warehouse,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/purchase/status-badge';
import { ReasonBadge } from '@/components/purchase/reason-badge';
import {
  usePurchaseReturns,
  useApprovePurchaseReturn,
  useRejectPurchaseReturn,
  useCancelPurchaseReturn,
} from '@/hooks/use-purchase-return';
import { useSuppliers } from '@/hooks/use-supplier';
import { useWarehouses } from '@/hooks/use-warehouse';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import type {
  PurchaseReturn,
  PurchaseReturnStatus,
  PurchaseReturnReason,
} from '@/types/purchase-return';
import type { ColumnDef } from '@tanstack/react-table';

export default function PurchaseReturnsPage() {
  const router = useRouter();
  const [q, setQ] = React.useState('');
  const [supplierId, setSupplierId] = React.useState('');
  const [warehouseId, setWarehouseId] = React.useState('');
  const [status, setStatus] = React.useState<PurchaseReturnStatus | 'ALL'>('ALL');
  const [reason, setReason] = React.useState<PurchaseReturnReason | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedRows, setSelectedRows] = React.useState<PurchaseReturn[]>([]);

  // Mutations
  const approveMutation = useApprovePurchaseReturn();
  const rejectMutation = useRejectPurchaseReturn();
  const cancelMutation = useCancelPurchaseReturn();

  // Queries
  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = usePurchaseReturns({
    page,
    limit: pageSize,
    q,
    supplierId,
    warehouseId,
    status,
    reason,
    dateFrom,
    dateTo,
  });

  const { data: supplierResponse } = useSuppliers({ page: 1, limit: 100 });
  const { data: warehouseResponse } = useWarehouses({ page: 1, limit: 100 });

  const returns = response?.data || [];
  const totalCount = response?.meta?.total ?? 0;

  const suppliers = supplierResponse?.data || [];
  const warehouses = warehouseResponse?.data || [];

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [q, supplierId, warehouseId, status, reason, dateFrom, dateTo]);

  // Bulk Actions
  const handleBulkApprove = async () => {
    if (selectedRows.length === 0) return;
    try {
      const pendingRows = selectedRows.filter((r) => r.status === 'PENDING');
      if (pendingRows.length === 0) {
        toast.warning('Only returns in PENDING status can be approved.');
        return;
      }
      await Promise.all(
        pendingRows.map((r) => approveMutation.mutateAsync({ id: r.id, notes: 'Bulk approved' })),
      );
      toast.success(`Successfully approved ${pendingRows.length} returns.`);
      setSelectedRows([]);
      void refetch();
    } catch {
      toast.error('Failed to approve some returns.');
    }
  };

  const handleBulkReject = async () => {
    if (selectedRows.length === 0) return;
    try {
      const pendingRows = selectedRows.filter((r) => r.status === 'PENDING');
      if (pendingRows.length === 0) {
        toast.warning('Only returns in PENDING status can be rejected.');
        return;
      }
      await Promise.all(
        pendingRows.map((r) => rejectMutation.mutateAsync({ id: r.id, notes: 'Bulk rejected' })),
      );
      toast.success(`Successfully rejected ${pendingRows.length} returns.`);
      setSelectedRows([]);
      void refetch();
    } catch {
      toast.error('Failed to reject some returns.');
    }
  };

  const handleBulkCancel = async () => {
    if (selectedRows.length === 0) return;
    try {
      const cancellableRows = selectedRows.filter(
        (r) => r.status === 'DRAFT' || r.status === 'PENDING',
      );
      if (cancellableRows.length === 0) {
        toast.warning('Only DRAFT or PENDING returns can be cancelled.');
        return;
      }
      await Promise.all(cancellableRows.map((r) => cancelMutation.mutateAsync(r.id)));
      toast.success(`Successfully cancelled ${cancellableRows.length} returns.`);
      setSelectedRows([]);
      void refetch();
    } catch {
      toast.error('Failed to cancel some returns.');
    }
  };

  const handleExport = () => {
    toast.info('Exporting return records as CSV...');
    // Real export simulation
    const headers =
      'Return Number,Supplier,Warehouse,Ref Type,Ref No,Return Date,Reason,Status,Total\n';
    const csvContent = returns
      .map(
        (r) =>
          `"${r.returnNumber}","${r.supplier?.companyName || ''}","${r.warehouse?.name || ''}","${r.referenceType}","${r.referencePoNumber || r.referenceGrnNumber || r.referenceInvoiceNumber || ''}","${r.returnDate}","${r.reason}","${r.status}",$${r.grandTotal.toFixed(2)}`,
      )
      .join('\n');
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Purchase_Returns_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  const columns: ColumnDef<PurchaseReturn>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'returnNumber',
      header: 'Return Number',
      cell: ({ row }) => (
        <Link
          href={`/purchase/returns/${row.original.id}`}
          className="font-mono font-bold text-primary hover:underline"
        >
          {row.getValue('returnNumber')}
        </Link>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier vendor',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {row.original.supplier?.companyName || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'warehouse',
      header: 'Warehouse',
      cell: ({ row }) => <span>{row.original.warehouse?.name || '—'}</span>,
    },
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ row }) => {
        const refNo =
          row.original.referencePoNumber ||
          row.original.referenceGrnNumber ||
          row.original.referenceInvoiceNumber ||
          'Direct';
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono font-semibold text-xs text-foreground/80">{refNo}</span>
            <span className="text-[10px] text-muted-foreground uppercase">
              {row.original.referenceType}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'returnDate',
      header: 'Return Date',
      cell: ({ row }) => <span>{new Date(row.getValue('returnDate')).toLocaleDateString()}</span>,
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <ReasonBadge reason={row.getValue('reason')} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'grandTotal',
      header: () => <div className="text-right">Grand Total</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono font-bold text-foreground">
          ${Number(row.getValue('grandTotal')).toFixed(2)}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center gap-1.5">
          <Link href={`/purchase/returns/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View details">
              <Eye className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </Button>
          </Link>
          {row.original.status === 'DRAFT' && (
            <Link href={`/purchase/returns/${row.original.id}/edit`}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit draft">
                <Edit2 className="w-3.5 h-3.5 text-primary hover:text-primary/80" />
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Return Management"
        description="Return defective product stock, manage supplier return claims, audit refunds, and generate supplier credit notes."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Link href="/purchase/returns/new">
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" /> Create Return
              </Button>
            </Link>
          </div>
        }
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-border gap-4 mb-6">
        <Link
          href="/purchase/returns"
          className="border-b-2 border-primary pb-2.5 px-1 font-semibold text-sm text-foreground flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4 text-primary" /> Active Returns
        </Link>
        <Link
          href="/purchase/returns/dashboard"
          className="pb-2.5 px-1 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        >
          <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Return Dashboard
        </Link>
        <Link
          href="/purchase/returns/history"
          className="pb-2.5 px-1 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        >
          <History className="w-4 h-4 text-muted-foreground" /> Audit History
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-sm border-border bg-card mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 text-sm">
            {/* Search Box */}
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search return code, supplier, PO, invoice..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9 h-9 border-border bg-card text-foreground"
              />
            </div>

            {/* Supplier Selector */}
            <div>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full text-xs rounded-lg border border-border bg-card p-2 h-9 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse Selector */}
            <div>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full text-xs rounded-lg border border-border bg-card p-2 h-9 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason Selector */}
            <div>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full text-xs rounded-lg border border-border bg-card p-2 h-9 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Reasons</option>
                <option value="DAMAGED">Damaged Product</option>
                <option value="EXPIRED">Expired</option>
                <option value="WRONG_PRODUCT">Wrong Product</option>
                <option value="WRONG_QUANTITY">Wrong Quantity</option>
                <option value="QUALITY_ISSUE">Quality Issue</option>
                <option value="PACKAGING_DAMAGE">Packaging Damage</option>
                <option value="SUPPLIER_ERROR">Supplier Error</option>
                <option value="MANUAL_CORRECTION">Manual Correction</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-between pt-2 border-t border-border/40 text-xs">
            <div className="flex gap-4 items-center">
              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Date range:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded border border-border bg-card p-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded border border-border bg-card p-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Status Select */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="rounded border border-border bg-card p-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQ('');
                setSupplierId('');
                setWarehouseId('');
                setStatus('ALL');
                setReason('ALL');
                setDateFrom('');
                setDateTo('');
              }}
              className="text-primary font-semibold h-8"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions display */}
      {selectedRows.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 mb-6 flex flex-wrap gap-4 items-center justify-between text-sm">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span>Selected {selectedRows.length} items</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-500 hover:text-emerald-600 gap-1"
              onClick={handleBulkApprove}
            >
              <CheckCircle className="w-3.5 h-3.5" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-rose-500 hover:text-rose-600 gap-1"
              onClick={handleBulkReject}
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-muted-foreground hover:text-foreground gap-1"
              onClick={handleBulkCancel}
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={returns}
        loading={isLoading}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        enableRowSelection={true}
        onRowSelectionChange={setSelectedRows}
        emptyTitle="No Returns Found"
        emptyDescription="Audit records and return claims will appear here once registered."
      />
    </PageContainer>
  );
}

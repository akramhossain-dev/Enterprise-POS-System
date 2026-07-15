'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  Warehouse as WarehouseIcon,
  Sliders,
  ShieldAlert,
  Calendar,
  X,
  FileDown,
} from 'lucide-react';
import { useBatches, useCreateBatch, useUpdateBatchStatus } from '@/hooks/use-inventory';
import { useWarehouses } from '@/hooks/use-warehouse';
import { useProducts } from '@/hooks/use-product';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { ExpiryBadge } from '@/components/inventory/expiry-badge';
import { DataTable } from '@/components/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { Batch, BatchStatus } from '@/types/inventory';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

// Zod schema for Creating Batch
const createBatchSchema = z.object({
  warehouseId: z.string().min(1, 'Please select a warehouse'),
  productId: z.string().min(1, 'Please select a product'),
  batchNumber: z.string().min(2, 'Batch number must be at least 2 characters'),
  manufacturingDate: z.string().optional(),
  expiryDate: z.string().optional(),
  quantity: z.coerce.number().min(0.001, 'Quantity must be greater than zero'),
  remarks: z.string().optional(),
});

type CreateBatchFormValues = z.infer<typeof createBatchSchema>;

// Zod schema for Status Change
const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'EXPIRED', 'DEPLETED', 'QUARANTINE']),
  remarks: z.string().optional(),
});

type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;

export default function BatchManagementPage() {
  const [q, setQ] = React.useState('');
  const [warehouseFilter, setWarehouseFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<BatchStatus | ''>('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Dialog controls
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedBatch, setSelectedBatch] = React.useState<Batch | null>(null);
  const [isStatusOpen, setIsStatusOpen] = React.useState(false);

  // Queries
  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const { data: productsResponse } = useProducts({ limit: 100 });
  const products = productsResponse?.data || [];

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
    status: statusFilter || undefined,
  });

  const batches = batchesResponse?.data || [];
  const totalCount = batchesResponse?.meta?.total ?? 0;

  // Mutations
  const createMutation = useCreateBatch();
  const statusMutation = useUpdateBatchStatus();

  // Create Form Hook
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<CreateBatchFormValues>({
    resolver: zodResolver(createBatchSchema),
  });

  // Status Form Hook
  const {
    register: registerStatus,
    handleSubmit: handleStatusSubmit,
    reset: resetStatus,
    formState: { errors: statusErrors },
  } = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
  });

  React.useEffect(() => {
    if (selectedBatch) {
      resetStatus({
        status: selectedBatch.status,
        remarks: selectedBatch.remarks || '',
      });
    }
  }, [selectedBatch, resetStatus]);

  const handleOpenStatusDialog = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsStatusOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setSelectedBatch(null);
    setIsStatusOpen(false);
  };

  const onCreateSubmit = async (values: CreateBatchFormValues) => {
    try {
      await createMutation.mutateAsync({
        companyId: '11111111-1111-1111-1111-111111111111', // default company UUID
        warehouseId: values.warehouseId,
        productId: values.productId,
        batchNumber: values.batchNumber,
        manufacturingDate: values.manufacturingDate || undefined,
        expiryDate: values.expiryDate || undefined,
        quantity: values.quantity,
        remarks: values.remarks,
      });
      setIsCreateOpen(false);
      resetCreate();
      void refetch();
    } catch {}
  };

  const onStatusSubmit = async (values: UpdateStatusFormValues) => {
    if (!selectedBatch) return;
    try {
      await statusMutation.mutateAsync({
        id: selectedBatch.id,
        payload: {
          status: values.status,
          remarks: values.remarks,
        },
      });
      handleCloseStatusDialog();
      void refetch();
    } catch {}
  };

  const handleExport = () => {
    toast.info('Exporting batches report (UI Only)...');
  };

  const columns: ColumnDef<Batch>[] = [
    {
      accessorKey: 'batchNumber',
      header: 'Batch Number',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">
          {row.original.batchNumber}
        </span>
      ),
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
        <div className="flex items-center gap-1 text-xs">
          <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
          {row.original.warehouse?.name || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => {
        return (
          <span className="font-bold text-foreground">
            {Number(row.original.quantity).toFixed(2)}
          </span>
        );
      },
    },
    {
      accessorKey: 'manufacturingDate',
      header: 'Mfg. Date',
      cell: ({ row }) => {
        const d = row.original.manufacturingDate;
        return d ? new Date(d).toLocaleDateString() : '—';
      },
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
      id: 'expiryStatus',
      header: 'Expiry Warning',
      cell: ({ row }) => <ExpiryBadge expiryDate={row.original.expiryDate} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm',
              s === 'ACTIVE' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
              s === 'EXPIRED' && 'bg-rose-500/10 text-rose-500 border-rose-500/20',
              s === 'DEPLETED' &&
                'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20',
              s === 'QUARANTINE' &&
                'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse',
            )}
          >
            {s}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleOpenStatusDialog(row.original)}
          title="Update batch status"
        >
          <Sliders className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Batch Management"
        description="Verify product manufacturing runs, check remaining shelf life, and configure quarantine gates for failed QA batches."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <FileDown className="w-4 h-4" /> Export Batches
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Batch
            </Button>
          </div>
        }
      />

      {/* Filtering Toolbar */}
      <div className="bg-card border rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search batch number..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-muted/20 border-border"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Warehouse Selector */}
          <select
            value={warehouseFilter}
            onChange={(e) => {
              setWarehouseFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-44"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-40"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="QUARANTINE">QUARANTINE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="DEPLETED">DEPLETED</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="h-9 px-3 w-full sm:w-auto"
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <TableSkeleton columns={9} rows={pageSize} />
      ) : (
        <div className="bg-card border rounded-xl shadow-sm p-4">
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
            emptyTitle="No tracking batches"
            emptyDescription="Create batches to initialize item shelf-life limits."
          />
        </div>
      )}

      {/* Dialog for Registering Batch */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl bg-popover border shadow-lg border-border">
          <form onSubmit={handleCreateSubmit(onCreateSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" /> Register Perishable Batch
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set manufacturing logs and quarantine checks for a new product batch.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Warehouse
                </label>
                <select
                  {...registerCreate('warehouseId')}
                  className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Depot...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                {createErrors.warehouseId && (
                  <p className="text-xs text-rose-500 font-medium">
                    {createErrors.warehouseId.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Product
                </label>
                <select
                  {...registerCreate('productId')}
                  className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Catalog Item...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku || 'No SKU'})
                    </option>
                  ))}
                </select>
                {createErrors.productId && (
                  <p className="text-xs text-rose-500 font-medium">
                    {createErrors.productId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Batch Identifier
                  </label>
                  <Input
                    {...registerCreate('batchNumber')}
                    placeholder="e.g. BATCH-2026-X"
                    className="bg-muted/20 border-border"
                  />
                  {createErrors.batchNumber && (
                    <p className="text-xs text-rose-500 font-medium">
                      {createErrors.batchNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    step="0.001"
                    {...registerCreate('quantity')}
                    placeholder="100.00"
                    className="bg-muted/20 border-border"
                  />
                  {createErrors.quantity && (
                    <p className="text-xs text-rose-500 font-medium">
                      {createErrors.quantity.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Mfg Date
                  </label>
                  <Input
                    type="date"
                    {...registerCreate('manufacturingDate')}
                    className="bg-muted/20 border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Expiry Date
                  </label>
                  <Input
                    type="date"
                    {...registerCreate('expiryDate')}
                    className="bg-muted/20 border-border"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Remarks / Notes
                </label>
                <Input
                  {...registerCreate('remarks')}
                  placeholder="Additional quality checks, QC parameters..."
                  className="bg-muted/20 border-border"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Create Batch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Modifying Status */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-popover border shadow-lg border-border">
          <form onSubmit={handleStatusSubmit(onStatusSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" /> Modify Batch Status
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Alter the status gates for batch number:
                <span className="font-semibold block mt-0.5 text-foreground">
                  {selectedBatch?.batchNumber}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-bold">
                  Quarantine Status Gate
                </label>
                <select
                  {...registerStatus('status')}
                  className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ACTIVE">ACTIVE — Normal Sales</option>
                  <option value="QUARANTINE">QUARANTINE — Locked from Sales</option>
                  <option value="EXPIRED">EXPIRED — Perished Items</option>
                  <option value="DEPLETED">DEPLETED — Fully Sold Out</option>
                </select>
                {statusErrors.status && (
                  <p className="text-xs text-rose-500 font-medium">{statusErrors.status.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status Remarks / Reasons
                </label>
                <Input
                  {...registerStatus('remarks')}
                  placeholder="e.g. Quarantined due to container seal leak"
                  className="bg-muted/20 border-border"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCloseStatusDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={statusMutation.isPending}>
                Update Status
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

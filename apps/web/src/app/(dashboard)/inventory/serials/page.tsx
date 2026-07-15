'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Barcode,
  Plus,
  RefreshCw,
  Search,
  Warehouse as WarehouseIcon,
  Sliders,
  ShieldCheck,
  Building,
  ChevronRight,
  FileDown,
} from 'lucide-react';
import {
  useSerials,
  useRegisterSerial,
  useRegisterSerialBulk,
  useUpdateSerialStatus,
} from '@/hooks/use-inventory';
import { useWarehouses } from '@/hooks/use-warehouse';
import { useProducts } from '@/hooks/use-product';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { DataTable } from '@/components/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { SerialNumber, SerialStatus } from '@/types/inventory';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

// Zod schemas for forms
const singleSerialSchema = z.object({
  warehouseId: z.string().min(1, 'Please select a warehouse'),
  productId: z.string().min(1, 'Please select a product'),
  serialNumber: z.string().min(3, 'Serial number must be at least 3 characters'),
  remarks: z.string().optional(),
});

type SingleSerialFormValues = z.infer<typeof singleSerialSchema>;

const bulkSerialSchema = z.object({
  warehouseId: z.string().min(1, 'Please select a warehouse'),
  productId: z.string().min(1, 'Please select a product'),
  serialNumbersText: z.string().min(3, 'Please enter at least one serial number'),
  remarks: z.string().optional(),
});

type BulkSerialFormValues = z.infer<typeof bulkSerialSchema>;

const serialStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'SOLD', 'DAMAGED', 'LOST', 'RETURNED']),
  remarks: z.string().optional(),
});

type SerialStatusFormValues = z.infer<typeof serialStatusSchema>;

export default function SerialNumberManagementPage() {
  const [q, setQ] = React.useState('');
  const [warehouseFilter, setWarehouseFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<SerialStatus | ''>('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Dialog states
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  const [selectedSerial, setSelectedSerial] = React.useState<SerialNumber | null>(null);
  const [isStatusOpen, setIsStatusOpen] = React.useState(false);

  // Queries
  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const { data: productsResponse } = useProducts({ limit: 100 });
  const products = productsResponse?.data || [];

  const {
    data: serialsResponse,
    isLoading,
    refetch,
    isFetching,
  } = useSerials({
    page,
    limit: pageSize,
    q: q || undefined,
    warehouseId: warehouseFilter || undefined,
    status: statusFilter || undefined,
  });

  const serials = serialsResponse?.data || [];
  const totalCount = serialsResponse?.meta?.total ?? 0;

  // Mutations
  const singleMutation = useRegisterSerial();
  const bulkMutation = useRegisterSerialBulk();
  const statusMutation = useUpdateSerialStatus();

  // Form Hooks
  const {
    register: registerSingle,
    handleSubmit: handleSingleSubmit,
    reset: resetSingle,
    formState: { errors: singleErrors },
  } = useForm<SingleSerialFormValues>({ resolver: zodResolver(singleSerialSchema) });

  const {
    register: registerBulk,
    handleSubmit: handleBulkSubmit,
    reset: resetBulk,
    formState: { errors: bulkErrors },
  } = useForm<BulkSerialFormValues>({ resolver: zodResolver(bulkSerialSchema) });

  const {
    register: registerStatus,
    handleSubmit: handleStatusSubmit,
    reset: resetStatus,
    formState: { errors: statusErrors },
  } = useForm<SerialStatusFormValues>({ resolver: zodResolver(serialStatusSchema) });

  React.useEffect(() => {
    if (selectedSerial) {
      resetStatus({
        status: selectedSerial.status,
        remarks: selectedSerial.remarks || '',
      });
    }
  }, [selectedSerial, resetStatus]);

  const handleOpenStatusDialog = (serial: SerialNumber) => {
    setSelectedSerial(serial);
    setIsStatusOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setSelectedSerial(null);
    setIsStatusOpen(false);
  };

  const onSingleSubmit = async (values: SingleSerialFormValues) => {
    try {
      await singleMutation.mutateAsync({
        companyId: '11111111-1111-1111-1111-111111111111',
        warehouseId: values.warehouseId,
        productId: values.productId,
        serialNumber: values.serialNumber,
        remarks: values.remarks,
      });
      setIsRegisterOpen(false);
      resetSingle();
      void refetch();
    } catch {}
  };

  const onBulkSubmit = async (values: BulkSerialFormValues) => {
    // Split serial numbers by newlines, commas, or spaces
    const list = values.serialNumbersText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (list.length === 0) {
      toast.error('Could not find any serials. Check commas or newlines.');
      return;
    }

    try {
      await bulkMutation.mutateAsync({
        companyId: '11111111-1111-1111-1111-111111111111',
        warehouseId: values.warehouseId,
        productId: values.productId,
        serialNumbers: list,
        remarks: values.remarks,
      });
      setIsRegisterOpen(false);
      resetBulk();
      void refetch();
    } catch {}
  };

  const onStatusSubmit = async (values: SerialStatusFormValues) => {
    if (!selectedSerial) return;
    try {
      await statusMutation.mutateAsync({
        id: selectedSerial.id,
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
    toast.info('Exporting serial numbers registry (UI Only)...');
  };

  const columns: ColumnDef<SerialNumber>[] = [
    {
      accessorKey: 'serialNumber',
      header: 'Serial Number',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs bg-muted px-2 py-1 rounded text-foreground">
          {row.original.serialNumber}
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm',
              s === 'AVAILABLE' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
              s === 'SOLD' && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
              s === 'DAMAGED' && 'bg-rose-500/10 text-rose-500 border-rose-500/20',
              s === 'LOST' && 'bg-rose-500/10 text-rose-500 border-rose-500/20',
              s === 'RETURNED' && 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            )}
          >
            {s}
          </span>
        );
      },
    },
    {
      id: 'customer',
      header: 'Assigned Customer',
      cell: ({ row }) => {
        return (
          <span className="text-xs text-muted-foreground">
            {row.original.assignedCustomer?.name || '—'}
          </span>
        );
      },
    },
    {
      id: 'warranty',
      header: 'Warranty',
      cell: ({ row }) => {
        const date = row.original.warrantyExpiry;
        return (
          <span className="text-xs text-muted-foreground">
            {date ? new Date(date).toLocaleDateString() : 'No warranty'}
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
          title="Update serial status"
        >
          <Sliders className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Serial Number Management"
        description="Verify singular and bulk hardware item serial logs, audit customer sales allocations, and monitor warranty boundaries."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <FileDown className="w-4 h-4" /> Export Registry
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsRegisterOpen(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Register Serials
            </Button>
          </div>
        }
      />

      {/* Filter toolbar */}
      <div className="bg-card border rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search serial number..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-muted/20 border-border"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Warehouse selector */}
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

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-40"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="SOLD">SOLD</option>
            <option value="DAMAGED">DAMAGED</option>
            <option value="LOST">LOST</option>
            <option value="RETURNED">RETURNED</option>
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
        <TableSkeleton columns={7} rows={pageSize} />
      ) : (
        <div className="bg-card border rounded-xl shadow-sm p-4">
          <DataTable
            columns={columns}
            data={serials}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyTitle="No serials registered"
            emptyDescription="Create serial numbers to track hardware assets."
          />
        </div>
      )}

      {/* Register Serials Dialog (Single and Bulk tabs) */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl bg-popover border shadow-lg border-border">
          <Tabs defaultValue="single">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Barcode className="w-5 h-5 text-primary" /> Register Hardware Serials
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Assign manufacturing unique keys to warehouses and products.
              </DialogDescription>
              <TabsList className="bg-muted/40 w-full grid grid-cols-2 p-1 rounded-xl mt-3">
                <TabsTrigger value="single" className="text-xs rounded-lg py-1.5">
                  Single Key
                </TabsTrigger>
                <TabsTrigger value="bulk" className="text-xs rounded-lg py-1.5">
                  Bulk Keys
                </TabsTrigger>
              </TabsList>
            </DialogHeader>

            {/* TAB: SINGLE REGISTRATION */}
            <TabsContent value="single">
              <form onSubmit={handleSingleSubmit(onSingleSubmit)}>
                <div className="space-y-4 py-2 text-sm">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Warehouse
                    </label>
                    <select
                      {...registerSingle('warehouseId')}
                      className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Depot...</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    {singleErrors.warehouseId && (
                      <p className="text-xs text-rose-500 font-medium">
                        {singleErrors.warehouseId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Product
                    </label>
                    <select
                      {...registerSingle('productId')}
                      className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Catalog Item...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {singleErrors.productId && (
                      <p className="text-xs text-rose-500 font-medium">
                        {singleErrors.productId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Serial Number Key
                    </label>
                    <Input
                      {...registerSingle('serialNumber')}
                      placeholder="e.g. SN-XXXX-XXXX"
                      className="bg-muted/20 border-border"
                    />
                    {singleErrors.serialNumber && (
                      <p className="text-xs text-rose-500 font-medium">
                        {singleErrors.serialNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Remarks / Notes
                    </label>
                    <Input
                      {...registerSingle('remarks')}
                      placeholder="Batch details or condition markers..."
                      className="bg-muted/20 border-border"
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsRegisterOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={singleMutation.isPending}>
                    Register
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            {/* TAB: BULK REGISTRATION */}
            <TabsContent value="bulk">
              <form onSubmit={handleBulkSubmit(onBulkSubmit)}>
                <div className="space-y-4 py-2 text-sm">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Warehouse
                    </label>
                    <select
                      {...registerBulk('warehouseId')}
                      className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Depot...</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    {bulkErrors.warehouseId && (
                      <p className="text-xs text-rose-500 font-medium">
                        {bulkErrors.warehouseId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Product
                    </label>
                    <select
                      {...registerBulk('productId')}
                      className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Catalog Item...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {bulkErrors.productId && (
                      <p className="text-xs text-rose-500 font-medium">
                        {bulkErrors.productId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Serial Keys (Comma or Newline Separated)
                    </label>
                    <Textarea
                      {...registerBulk('serialNumbersText')}
                      placeholder="SN-123-456&#10;SN-789-101&#10;SN-222-333"
                      rows={5}
                      className="bg-muted/20 border-border"
                    />
                    {bulkErrors.serialNumbersText && (
                      <p className="text-xs text-rose-500 font-medium">
                        {bulkErrors.serialNumbersText.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Remarks / Notes
                    </label>
                    <Input
                      {...registerBulk('remarks')}
                      placeholder="Batch details or condition markers..."
                      className="bg-muted/20 border-border"
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsRegisterOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={bulkMutation.isPending}>
                    Register Bulk
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Dialog for Modifying Status */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-popover border shadow-lg border-border">
          <form onSubmit={handleStatusSubmit(onStatusSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" /> Alter Serial Status
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set active asset status for key:
                <span className="font-semibold block mt-0.5 text-foreground">
                  {selectedSerial?.serialNumber}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-bold">
                  Asset State
                </label>
                <select
                  {...registerStatus('status')}
                  className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="AVAILABLE">AVAILABLE — In stock for Sales</option>
                  <option value="SOLD">SOLD — Assigned to Invoice</option>
                  <option value="DAMAGED">DAMAGED — QA Blocked</option>
                  <option value="LOST">LOST — Missing asset</option>
                  <option value="RETURNED">RETURNED — Return item</option>
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
                  placeholder="e.g. Lost in rack 4 bin B, audit check"
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

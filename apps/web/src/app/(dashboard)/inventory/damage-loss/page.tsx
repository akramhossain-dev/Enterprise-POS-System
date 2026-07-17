'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import {
  SlidersHorizontal,
  Plus,
  RefreshCw,
  Search,
  Warehouse as WarehouseIcon,
  FileDown,
  Trash2,
  AlertTriangle,
  Loader2,
  Package,
  AlertOctagon,
  TrendingDown,
} from 'lucide-react';
import { useAdjustments, useCreateAdjustment } from '@/hooks/use-operations';
import { useWarehouses } from '@/hooks/use-warehouse';
import { WarehouseSelector } from '@/components/operations/warehouse-selector';
import { ProductSelector } from '@/components/operations/product-selector';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { DataTable } from '@/components/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { StockAdjustment } from '@/types/inventory';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

// Validation schema for inline Record Damage/Loss form
const recordSchema = z.object({
  warehouseId: z.string().min(1, 'Please select a warehouse depot'),
  productId: z.string().min(1, 'Please select a product'),
  type: z.enum(['DAMAGE', 'LOST', 'EXPIRED']),
  quantity: z.coerce.number().min(0.01, 'Quantity must be at least 0.01'),
  reason: z.string().min(1, 'Please enter a brief reason'),
  remarks: z.string().optional(),
});

type RecordFormValues = z.infer<typeof recordSchema>;

export default function DamageLossPage() {
  const [q, setQ] = React.useState('');
  const [warehouseFilter, setWarehouseFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'DAMAGE' | 'LOST' | 'EXPIRED' | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [showFilters, setShowFilters] = React.useState(false);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  // Load adjustments but restrict/filter types to DAMAGE, LOST, or EXPIRED
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
    // If filtering all damage/loss, tell hooks we want all (we filter types in our selector or let the list return them).
    // The backend lists all stock adjustments. We filter them locally or by querying specific types.
    type: typeFilter === 'ALL' ? undefined : (typeFilter as any),
  });

  const createMutation = useCreateAdjustment();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      type: 'DAMAGE',
      reason: 'Broken Cartons',
    },
  });

  const selectedWarehouseId = watch('warehouseId');
  const selectedProductId = watch('productId');
  const selectedType = watch('type');

  const [selectedProductDetails, setSelectedProductDetails] = React.useState<{
    name: string;
    sku?: string | null;
    availableQuantity?: number;
  } | null>(null);

  // Filter adjustments locally to make sure we ONLY display DAMAGE, LOST, and EXPIRED types (excluding generic INCREASE / DECREASE)
  const filteredAdjustments = React.useMemo(() => {
    const raw = response?.data || [];
    return raw.filter((adj) => ['DAMAGE', 'LOST', 'EXPIRED'].includes(adj.type));
  }, [response]);

  const totalCount = filteredAdjustments.length;

  const handleSelectProduct = (prod: any) => {
    setValue('productId', prod.id);
    setSelectedProductDetails(prod);
  };

  const handleLogRecord = async (values: RecordFormValues) => {
    if (
      selectedProductDetails?.availableQuantity !== undefined &&
      values.quantity > selectedProductDetails.availableQuantity
    ) {
      if (
        !window.confirm(
          `Record quantity (${values.quantity}) exceeds available stock (${selectedProductDetails.availableQuantity}). Do you wish to proceed?`,
        )
      ) {
        return;
      }
    }

    try {
      await createMutation.mutateAsync({
        companyId: '11111111-1111-1111-1111-111111111111',
        warehouseId: values.warehouseId,
        productId: values.productId,
        type: values.type,
        quantity: values.quantity,
        reason: values.reason,
        remarks: values.remarks,
      });
      setIsFormOpen(false);
      reset({
        type: 'DAMAGE',
        reason: 'Broken Cartons',
      });
      setSelectedProductDetails(null);
      void refetch();
    } catch {}
  };

  const columns: ColumnDef<StockAdjustment>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Logged Date',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      id: 'product',
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex flex-col font-medium">
          <span className="font-semibold text-foreground text-sm">
            {row.original.product?.name || '—'}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            SKU: {row.original.product?.sku || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      id: 'warehouse',
      header: 'Warehouse',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-foreground">
          <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
          {row.original.warehouse?.name || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Category Type',
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border',
              type === 'DAMAGE' && 'bg-amber-500/10 text-amber-500 border-amber-500/20',
              type === 'EXPIRED' && 'bg-rose-500/10 text-rose-500 border-rose-500/20',
              type === 'LOST' && 'bg-red-500/10 text-red-500 border-red-500/20',
            )}
          >
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: 'quantity',
      header: 'Lost Qty',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-rose-500">
          -{Number(row.original.quantity).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-medium">{row.original.reason}</span>
      ),
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground italic max-w-xs truncate block">
          {row.original.remarks || '—'}
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
        title="Damage & Loss Records"
        description="Monitor write-offs, log product breakage, register lost goods, and handle expired perishable item disposals."
        actions={
          <Button size="sm" onClick={() => setIsFormOpen(!isFormOpen)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Log Damage/Loss
          </Button>
        }
      />

      {isFormOpen && (
        <Card className="mb-6 shadow-sm border-border bg-card animate-in fade-in slide-in-from-top-2 duration-200">
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-primary">
              <AlertTriangle className="w-4 h-4 text-primary" /> Log New Damage or Loss Event
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Submit write-off events to adjust product stock counts downward.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(handleLogRecord)} className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Warehouse */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Warehouse Location
                  </label>
                  <Controller
                    name="warehouseId"
                    control={control}
                    render={({ field }) => (
                      <WarehouseSelector
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.warehouseId?.message}
                        placeholder="Select location where loss occurred..."
                      />
                    )}
                  />
                </div>

                {/* Product Search */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Product Item
                  </label>
                  {selectedWarehouseId ? (
                    <ProductSelector
                      warehouseId={selectedWarehouseId}
                      onSelect={handleSelectProduct}
                      excludeIds={selectedProductId ? [selectedProductId] : []}
                    />
                  ) : (
                    <div className="bg-muted/30 border border-dashed rounded-lg p-2.5 text-center text-xs text-muted-foreground">
                      Select warehouse depot first to search products
                    </div>
                  )}
                  {errors.productId && (
                    <p className="text-xs font-semibold text-rose-500 mt-1">
                      {errors.productId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Category Type
                  </label>
                  <select
                    {...register('type')}
                    className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none"
                  >
                    <option value="DAMAGE">DAMAGE Write-off</option>
                    <option value="LOST">LOST Stock Write-off</option>
                    <option value="EXPIRED">EXPIRED Disposal</option>
                  </select>
                </div>

                {/* Qty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('quantity')}
                    placeholder="0.00"
                    className="bg-muted/10 border-border"
                  />
                  {errors.quantity && (
                    <p className="text-xs font-semibold text-rose-500">{errors.quantity.message}</p>
                  )}
                </div>

                {/* Reason */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Primary Reason
                  </label>
                  <Input
                    {...register('reason')}
                    placeholder="e.g. Broken in shipping, Water leak..."
                    className="bg-muted/10 border-border"
                  />
                  {errors.reason && (
                    <p className="text-xs font-semibold text-rose-500">{errors.reason.message}</p>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Remarks & Internal Notes
                </label>
                <Textarea
                  {...register('remarks')}
                  placeholder="Record description of loss event..."
                  rows={3}
                  className="bg-muted/10 border-border"
                />
              </div>

              {/* Evidence UI Foundation dropzone */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Evidence Media (UI Foundation)
                </span>
                <div className="border border-dashed rounded-lg p-4 text-center bg-muted/10 border-border hover:bg-muted/30 cursor-pointer">
                  <AlertOctagon className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                  <span className="text-xs text-muted-foreground">
                    Upload photoproofs or surveyor receipts
                  </span>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Write-off
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Toolbar filters */}
      <div className="bg-card border rounded-xl p-4 mb-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search product name or SKU..."
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
                Warehouse Depot
              </label>
              <select
                value={warehouseFilter}
                onChange={(e) => {
                  setWarehouseFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none"
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Loss Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none"
              >
                <option value="ALL">All Write-offs</option>
                <option value="DAMAGE">DAMAGE</option>
                <option value="LOST">LOST</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid list */}
      {isLoading ? (
        <TableSkeleton columns={7} rows={pageSize} />
      ) : (
        <div className="bg-card border rounded-xl shadow-sm p-4">
          <DataTable
            columns={columns}
            data={filteredAdjustments}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyTitle="No damage or loss records found"
            emptyDescription="Log breakage, theft, or product expiration events to write off stock."
          />
        </div>
      )}
    </PageContainer>
  );
}

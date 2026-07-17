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
  Eye,
  Warehouse as WarehouseIcon,
  Loader2,
  Calendar,
  Layers,
  ClipboardList,
} from 'lucide-react';
import { useStockTakes, useCreateStockTake } from '@/hooks/use-operations';
import { useWarehouses } from '@/hooks/use-warehouse';
import { WarehouseSelector } from '@/components/operations/warehouse-selector';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { DataTable } from '@/components/data-table/data-table';
import { ApprovalBadge } from '@/components/operations/approval-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ColumnDef } from '@tanstack/react-table';
import type { StockTake, StockTakeStatus } from '@/types/inventory';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(1, 'Please enter a title/description for this session'),
  warehouseId: z.string().min(1, 'Please select a warehouse depot'),
  conductedBy: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CycleCountPage() {
  const [q, setQ] = React.useState('');
  const [warehouseFilter, setWarehouseFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<StockTakeStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [showFilters, setShowFilters] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = useStockTakes({
    page,
    limit: pageSize,
    q: q || undefined,
    warehouseId: warehouseFilter || undefined,
    status: statusFilter,
  });

  const createMutation = useCreateStockTake();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: `Cycle Count Session — ${new Date().toLocaleDateString()}`,
    },
  });

  const stockTakes = response?.data || [];
  const totalCount = response?.meta?.total ?? 0;

  const handleCreateSession = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        companyId: '11111111-1111-1111-1111-111111111111',
        warehouseId: values.warehouseId,
        title: values.title,
        conductedBy: values.conductedBy || undefined,
      });
      setIsCreateOpen(false);
      reset({
        title: `Cycle Count Session — ${new Date().toLocaleDateString()}`,
      });
    } catch {}
  };

  const columns: ColumnDef<StockTake>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Audit Date',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: 'title',
      header: 'Session Name',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">{row.original.title}</span>
      ),
    },
    {
      id: 'warehouse',
      header: 'Warehouse Depot',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
          {row.original.warehouse?.name || '—'}
        </div>
      ),
    },
    {
      id: 'itemsCount',
      header: 'Audited Items',
      cell: ({ row }) => (
        <span className="text-xs font-mono">{row.original.items?.length ?? 0} SKUs</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <ApprovalBadge status={row.original.status} />,
    },
    {
      id: 'reconciliation',
      header: 'Reconciliation File',
      cell: ({ row }) => {
        const recon = row.original.reconciliation;
        if (!recon)
          return <span className="text-muted-foreground italic text-xs">No reconciliation</span>;
        return <ApprovalBadge status={recon.status} />;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link href={`/inventory/cycle-count/${row.original.id}`}>
          <Button size="sm" className="h-8 gap-1">
            <Eye className="w-3.5 h-3.5" /> Verification Sheet
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
        title="Cycle Count Sessions"
        description="Verify actual physical inventory counts against system records, calculate variances, and approve stock reconciliations."
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" /> Start Cycle Count
          </Button>
        }
      />

      {/* Toolbar filters */}
      <div className="bg-card border rounded-xl p-4 mb-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search session title..."
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
              {(warehouseFilter || statusFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
            {(q || warehouseFilter || statusFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-9"
                onClick={() => {
                  setQ('');
                  setWarehouseFilter('');
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

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Session Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
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
            data={stockTakes}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyTitle="No cycle count sessions found"
            emptyDescription="Create cycle counts to perform regular audits on physical warehouse stocks."
          />
        </div>
      )}

      {/* Initiate Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-card border">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> Start Cycle Count Session
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select the warehouse depot to run audit lists against. The session starts in DRAFT.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleCreateSession)} className="space-y-4 text-sm mt-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Session Audit Title
              </label>
              <Input {...register('title')} className="bg-muted/10 border-border font-medium" />
              {errors.title && (
                <p className="text-xs font-semibold text-rose-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Warehouse Depot to Audit
              </label>
              <Controller
                name="warehouseId"
                control={control}
                render={({ field }) => (
                  <WarehouseSelector
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.warehouseId?.message}
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Assigned Counter / Operator (ID Optional)
              </label>
              <Input
                {...register('conductedBy')}
                placeholder="counter-operator-uuid"
                className="bg-muted/10 border-border font-mono text-xs"
              />
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Session
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

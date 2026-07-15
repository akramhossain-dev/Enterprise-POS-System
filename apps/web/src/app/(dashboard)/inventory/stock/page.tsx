'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Search,
  SlidersHorizontal,
  X,
  FileDown,
  ChevronRight,
  Eye,
  Sliders,
  Warehouse as WarehouseIcon,
  RefreshCw,
} from 'lucide-react';
import { useInventoryList, useUpdateMinStock } from '@/hooks/use-inventory';
import { useWarehouses } from '@/hooks/use-warehouse';
import { productService } from '@/services/product.service'; // For categories list lookup
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
import { StockStatusBadge } from '@/components/inventory/stock-status-badge';
import { ExpiryBadge } from '@/components/inventory/expiry-badge';
import { DataTable } from '@/components/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { Inventory } from '@/types/inventory';
import type { Category } from '@/types/product';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

// Zod schema for Threshold Dialog Form
const thresholdSchema = z.object({
  minimumQuantity: z.coerce.number().min(0, 'Minimum stock must be 0 or more'),
  reorderQuantity: z.coerce.number().min(0, 'Reorder quantity must be 0 or more'),
});

type ThresholdFormValues = z.infer<typeof thresholdSchema>;

export default function CurrentStockPage() {
  // Filter States
  const [q, setQ] = React.useState('');
  const [warehouseFilter, setWarehouseFilter] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [stockStatusFilter, setStockStatusFilter] = React.useState<
    'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  >('ALL');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [showFilters, setShowFilters] = React.useState(false);

  // Dialog State
  const [selectedInventory, setSelectedInventory] = React.useState<Inventory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Queries
  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const [categories, setCategories] = React.useState<Category[]>([]);
  React.useEffect(() => {
    productService
      .getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

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
    categoryId: categoryFilter || undefined,
    stockStatus: stockStatusFilter !== 'ALL' ? stockStatusFilter : undefined,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const inventories = inventoryResponse?.data || [];
  const totalCount = inventoryResponse?.meta?.total ?? 0;

  // Mutations
  const updateThresholdMutation = useUpdateMinStock();

  // Dialog form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ThresholdFormValues>({
    resolver: zodResolver(thresholdSchema),
  });

  React.useEffect(() => {
    if (selectedInventory) {
      reset({
        minimumQuantity: Number(selectedInventory.minimumQuantity),
        reorderQuantity: Number(selectedInventory.reorderQuantity),
      });
    }
  }, [selectedInventory, reset]);

  const handleOpenDialog = (inv: Inventory) => {
    setSelectedInventory(inv);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedInventory(null);
    setIsDialogOpen(false);
  };

  const onThresholdSubmit = async (values: ThresholdFormValues) => {
    if (!selectedInventory) return;
    try {
      await updateThresholdMutation.mutateAsync({
        inventoryId: selectedInventory.id,
        minimumQuantity: values.minimumQuantity,
        reorderQuantity: values.reorderQuantity,
      });
      handleCloseDialog();
      void refetch();
    } catch {}
  };

  const handleResetFilters = () => {
    setQ('');
    setWarehouseFilter('');
    setCategoryFilter('');
    setStockStatusFilter('ALL');
    setPage(1);
  };

  const handleExportStock = () => {
    toast.info('Exporting current stock list (UI Only)...');
  };

  // Define TanStack columns
  const columns: ColumnDef<Inventory>[] = [
    {
      id: 'product',
      header: 'Product',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-foreground text-sm">
              {item.product?.name ?? '—'}
            </span>
            <span className="text-[10px] text-muted-foreground bg-muted w-max px-1.5 py-0.5 rounded">
              ID: {item.product?.id.slice(0, 8)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => row.original.product?.sku || '—',
    },
    {
      accessorKey: 'barcode',
      header: 'Barcode',
      cell: ({ row }) => row.original.product?.barcode || '—',
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => row.original.product?.category?.name || '—',
    },
    {
      id: 'warehouse',
      header: 'Warehouse',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">
              {item.warehouse?.name || '—'}
            </span>
          </div>
        );
      },
    },
    {
      id: 'currentStock',
      header: 'Current Stock',
      cell: ({ row }) => {
        const item = row.original;
        const total = Number(item.availableQuantity) + Number(item.reservedQuantity);
        return <span className="font-bold text-foreground">{total.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: 'reservedQuantity',
      header: 'Reserved Stock',
      cell: ({ row }) => {
        const qty = Number(row.original.reservedQuantity);
        return qty > 0 ? (
          <span className="text-amber-500 font-semibold">{qty.toFixed(2)}</span>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        );
      },
    },
    {
      accessorKey: 'availableQuantity',
      header: 'Available Stock',
      cell: ({ row }) => {
        const qty = Number(row.original.availableQuantity);
        return <span className="text-foreground font-semibold">{qty.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: 'minimumQuantity',
      header: 'Min Stock',
      cell: ({ row }) => Number(row.original.minimumQuantity).toFixed(2),
    },
    {
      accessorKey: 'maximumQuantity',
      header: 'Max Stock',
      cell: ({ row }) => {
        const max = row.original.maximumQuantity;
        return max ? Number(max).toFixed(2) : '—';
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <StockStatusBadge
            availableQuantity={Number(item.availableQuantity)}
            minimumQuantity={Number(item.minimumQuantity)}
          />
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Link href={`/inventory/${item.id}`}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
                <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleOpenDialog(item)}
              title="Configure threshold targets"
            >
              <Sliders className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Warehouse Inventory Directory"
        description="Oversee and manage product stock levels across multi-branch warehouses, verify reserved sales, and alter alert thresholds."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportStock} className="gap-1.5">
              <FileDown className="w-4 h-4" />
              Export Directory
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="h-9 px-3"
            >
              <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            </Button>
          </div>
        }
      />

      {/* Search & Filter Header Toolbar */}
      <div className="bg-card border rounded-xl p-4 mb-6 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search product, SKU, barcode..."
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
              {(warehouseFilter || categoryFilter || stockStatusFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
            {(q || warehouseFilter || categoryFilter || stockStatusFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs h-9"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible advanced filters */}
        {showFilters && (
          <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Warehouse select list */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Warehouse
              </label>
              <select
                value={warehouseFilter}
                onChange={(e) => {
                  setWarehouseFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category select list */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock status filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Stock Status
              </label>
              <select
                value={stockStatusFilter}
                onChange={(e) => {
                  setStockStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock Warning</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main DataTable list */}
      {isLoading ? (
        <TableSkeleton columns={11} rows={pageSize} />
      ) : (
        <div className="bg-card border rounded-xl shadow-sm p-4">
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
            emptyTitle="No inventories registered"
            emptyDescription="Either match search parameters or add opening stocks to initialize warehouse items."
          />
        </div>
      )}

      {/* Threshold configuration modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-popover border shadow-lg border-border">
          <form onSubmit={handleSubmit(onThresholdSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                Configure Threshold Levels
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set minimum stock warnings and reorder trigger indices for:
                <span className="font-semibold block mt-1 text-foreground">
                  {selectedInventory?.product?.name}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Minimum Stock Threshold (Safety Stock)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('minimumQuantity')}
                  placeholder="0.00"
                  className="bg-muted/20 border-border"
                />
                {errors.minimumQuantity && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.minimumQuantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Reorder Level Point
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('reorderQuantity')}
                  placeholder="0.00"
                  className="bg-muted/20 border-border"
                />
                {errors.reorderQuantity && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.reorderQuantity.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

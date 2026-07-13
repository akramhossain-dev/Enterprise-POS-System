'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Search,
  RefreshCw,
  Archive,
  Trash2,
  RotateCcw,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useProducts, useDeleteProduct, useRestoreProduct } from '@/hooks/use-product';
import { DataTable } from '@/components/data-table/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Product } from '@/types/product';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

export default function ArchivedProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [q, setQ] = useState('');
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  const { data, isLoading, refetch, isFetching } = useProducts({
    page,
    limit: pageSize,
    q,
    status: 'DISCONTINUED', // Load archived products only
  });

  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: restoreProduct } = useRestoreProduct();

  const handleRestore = (id: string) => {
    restoreProduct(id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this product permanently? This cannot be undone.')) {
      deleteProduct(id);
    }
  };

  const handleBulkRestore = () => {
    if (selectedRows.length === 0) return;
    let count = 0;
    selectedRows.forEach((row) => {
      restoreProduct(row.id, {
        onSuccess: () => {
          count++;
          if (count === selectedRows.length) {
            toast.success(`Successfully restored ${selectedRows.length} products`);
            setSelectedRows([]);
          }
        },
      });
    });
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (
      confirm(`Delete ${selectedRows.length} selected products permanently? This cannot be undone.`)
    ) {
      let count = 0;
      selectedRows.forEach((row) => {
        deleteProduct(row.id, {
          onSuccess: () => {
            count++;
            if (count === selectedRows.length) {
              toast.success(`Successfully deleted ${selectedRows.length} products`);
              setSelectedRows([]);
            }
          },
        });
      });
    }
  };

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            aria-label="Select all"
            className="rounded border-input text-primary focus:ring-ring"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            aria-label="Select row"
            className="rounded border-input text-primary focus:ring-ring"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="font-semibold text-muted-foreground">{row.original.name}</div>
        ),
      },
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku || '—'}</span>,
      },
      {
        accessorKey: 'barcode',
        header: 'Barcode',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.barcode || '—'}</span>,
      },
      {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
        cell: ({ row }) => formatCurrency(Number(row.original.sellingPrice)),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5">
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Button
                size="icon-xs"
                variant="ghost"
                title="Restore product"
                className="text-primary hover:bg-primary/10"
                onClick={() => handleRestore(product.id)}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                title="Delete permanently"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(product.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [restoreProduct, deleteProduct],
  );

  return (
    <PageContainer>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/products">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to catalog</span>
      </div>

      <PageHeader
        title="Archived & Discontinued Products"
        description="View and restore products that have been soft-deleted or marked as discontinued."
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 bg-card border border-border p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 w-full sm:max-w-md relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search archived products..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 rounded-lg pl-9 pr-4 bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center border border-border rounded-lg p-0.5 bg-background">
              <Button
                size="xs"
                variant={density === 'compact' ? 'secondary' : 'ghost'}
                onClick={() => setDensity('compact')}
                className="px-1.5 h-7"
                title="Compact View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="xs"
                variant={density === 'comfortable' ? 'secondary' : 'ghost'}
                onClick={() => setDensity('comfortable')}
                className="px-1.5 h-7"
                title="Normal View"
              >
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => void refetch()}
              loading={isFetching}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Bulk actions strip */}
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20 text-sm mt-1 animate-scale-in">
            <span className="text-sm font-semibold text-primary">
              {selectedRows.length} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={handleBulkRestore}
                leftIcon={<RotateCcw className="w-3 h-3 text-primary" />}
                className="text-primary border-primary/20 hover:bg-primary/10"
              >
                Bulk Restore
              </Button>
              <Button
                size="xs"
                variant="destructive"
                onClick={handleBulkDelete}
                leftIcon={<Trash2 className="w-3 h-3" />}
              >
                Bulk Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        totalCount={data?.meta?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        enableRowSelection
        onRowSelectionChange={setSelectedRows}
        emptyTitle="No archived products"
        emptyDescription="There are no discontinued products in the catalog archive."
        className={cn(density === 'compact' && '[&_td]:py-1.5 [&_th]:py-2')}
      />
    </PageContainer>
  );
}

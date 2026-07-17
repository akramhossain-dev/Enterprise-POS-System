'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { useCategoriesList, useRestoreCategory, useDeleteCategory } from '@/hooks/use-catalog';
import { DataTable } from '@/components/data-table/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format';
import type { Category } from '@/types/product';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

export default function ArchivedCategoriesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [q, setQ] = useState('');
  const [selectedRows, setSelectedRows] = useState<Category[]>([]);

  // Fetch only soft-deleted (DELETED status) categories
  const {
    data: categoriesData,
    isLoading,
    refetch,
    isFetching,
  } = useCategoriesList({
    page,
    limit: pageSize,
    q: q || undefined,
    status: 'DELETED',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const categories = categoriesData?.data ?? [];
  const totalCount = categoriesData?.meta?.total ?? 0;

  const { mutate: restoreCategory } = useRestoreCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const handleBulkRestore = () => {
    if (selectedRows.length === 0) return;
    let count = 0;
    selectedRows.forEach((row) => {
      restoreCategory(row.id, {
        onSuccess: () => {
          count++;
          if (count === selectedRows.length) {
            toast.success(`Successfully restored ${selectedRows.length} categories`);
            setSelectedRows([]);
            void refetch();
          }
        },
      });
    });
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (
      confirm(
        `Permanently delete ${selectedRows.length} selected categories? This cannot be undone.`,
      )
    ) {
      let count = 0;
      selectedRows.forEach((row) => {
        deleteCategory(row.id, {
          onSuccess: () => {
            count++;
            if (count === selectedRows.length) {
              toast.success(`Successfully deleted ${selectedRows.length} categories`);
              setSelectedRows([]);
              void refetch();
            }
          },
        });
      });
    }
  };

  // Columns definition for DataTable
  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            className="rounded border-input text-primary focus:ring-ring"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            className="rounded border-input text-primary focus:ring-ring"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }) => {
          const url = row.original.image;
          const initials = row.original.name.substring(0, 2).toUpperCase();
          return (
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted flex items-center justify-center border border-border">
              {url ? (
                <img src={url} alt={row.original.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-muted-foreground font-semibold">{initials}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-foreground">{row.original.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono">
              /{row.original.slug || ''}
            </div>
          </div>
        ),
      },
      {
        id: 'productCount',
        header: 'Product Count',
        cell: ({ row }) => (
          <Badge variant="outline">{row.original._count?.products ?? 0} products</Badge>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Archived Date',
        cell: ({ row }) => formatDate(row.original.updatedAt ?? ''),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                restoreCategory(row.original.id, {
                  onSuccess: () => {
                    toast.success('Category restored successfully');
                    void refetch();
                  },
                });
              }}
              title="Restore category"
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                if (confirm('Permanently delete this category? This cannot be undone.')) {
                  deleteCategory(row.original.id, {
                    onSuccess: () => {
                      toast.success('Category deleted successfully');
                      void refetch();
                    },
                  });
                }
              }}
              title="Delete permanently"
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <PageContainer>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/products/categories">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to categories</span>
      </div>

      <div className="mt-4">
        <PageHeader
          title="Archived Categories"
          description="View and restore soft-deleted categories or delete them permanently."
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border border-border bg-card p-4 rounded-xl shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search archived category name, description, slug..."
              className="pl-9 h-9"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            loading={isFetching}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            className="h-9"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Selected Rows Bulk Toolbar */}
      {selectedRows.length > 0 && (
        <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between text-xs animate-[fadeIn_0.15s_ease-out]">
          <span className="font-medium text-foreground">
            {selectedRows.length} categories selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="xs"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleBulkRestore}
              className="bg-background"
            >
              Restore Selected
            </Button>
            <Button
              variant="destructive"
              size="xs"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={handleBulkDelete}
            >
              Delete Selected (Permanent)
            </Button>
          </div>
        </div>
      )}

      {/* Render Table */}
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={categories}
          loading={isLoading}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          enableRowSelection
          onRowSelectionChange={setSelectedRows}
          emptyTitle="No Archived Categories"
          emptyDescription="Categories you delete will be archived here. They can be restored at any time."
        />
      </div>
    </PageContainer>
  );
}

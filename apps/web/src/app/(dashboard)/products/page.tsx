'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  RefreshCw,
  Layers,
  Archive,
  Trash2,
  Eye,
  Edit,
  Barcode as BarcodeIcon,
  Download,
  Filter,
  ChevronDown,
  Check,
  MoreVertical,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  useProducts,
  useDeleteProduct,
  useArchiveProduct,
  useCategories,
  useBrands,
} from '@/hooks/use-product';
import { DataTable } from '@/components/data-table/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Product, ProductStatus } from '@/types/product';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

export default function ProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('ACTIVE'); // Default to active products
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [showFilters, setShowFilters] = useState(false);

  // Right-click context menu coordinates
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; product: Product } | null>(
    null,
  );

  const { data, isLoading, refetch, isFetching, isError, error } = useProducts({
    page,
    limit: pageSize,
    q,
    status: status || undefined,
    categoryId: categoryId || undefined,
    brandId: brandId || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: archiveProduct } = useArchiveProduct();

  const handleBulkArchive = () => {
    if (selectedRows.length === 0) return;
    let count = 0;
    selectedRows.forEach((row) => {
      archiveProduct(row.id, {
        onSuccess: () => {
          count++;
          if (count === selectedRows.length) {
            toast.success(`Successfully archived ${selectedRows.length} products`);
            setSelectedRows([]);
          }
        },
      });
    });
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (confirm(`Delete ${selectedRows.length} selected products?`)) {
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
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }) => {
          const url = row.original.image ?? row.original.images?.[0]?.url;
          return (
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center border border-border">
              {url ? (
                <img src={url} alt={row.original.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground font-semibold">
                  {row.original.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div
            className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
            onClick={() => router.push(`/products/${row.original.id}`)}
          >
            {row.original.name}
          </div>
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
        id: 'category',
        header: 'Category',
        cell: ({ row }) => row.original.category?.name || '—',
      },
      {
        id: 'brand',
        header: 'Brand',
        cell: ({ row }) => row.original.brand?.name || '—',
      },
      {
        id: 'unit',
        header: 'Unit',
        cell: ({ row }) => row.original.unit?.shortName || '—',
      },
      {
        accessorKey: 'purchasePrice',
        header: 'Cost Price',
        cell: ({ row }) => formatCurrency(Number(row.original.purchasePrice)),
      },
      {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
        cell: ({ row }) => formatCurrency(Number(row.original.sellingPrice)),
      },
      {
        id: 'stock',
        header: 'Stock',
        cell: ({ row }) => {
          const qty = row.original.stockSummary?.totalQuantity ?? 0;
          return (
            <span
              className={cn(
                'font-semibold text-xs px-1.5 py-0.5 rounded-full',
                qty <= 5 ? 'bg-backgroundestructive/10 text-destructive' : 'bg-muted text-muted-foreground',
              )}
            >
              {qty}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant={
                status === 'ACTIVE' ? 'default' : status === 'INACTIVE' ? 'secondary' : 'outline'
              }
            >
              {status}
            </Badge>
          );
        },
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
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" size="icon-xs" aria-label="Open menu">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    className="z-[1060] min-w-[140px] bg-popover border border-border rounded-lg p-1 shadow-lg"
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        href={`/products/${product.id}`}
                        className="flex items-center gap-2 px-2.5 py-2 text-xs rounded hover:bg-accent cursor-pointer outline-none"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Details
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="flex items-center gap-2 px-2.5 py-2 text-xs rounded hover:bg-accent cursor-pointer outline-none"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit Product
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-border my-1" />
                    <DropdownMenu.Item
                      onSelect={() => archiveProduct(product.id)}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs rounded hover:bg-accent text-amber-500 cursor-pointer outline-none"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Archive
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => {
                        if (confirm('Delete this product?')) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs rounded hover:bg-accent text-destructive cursor-pointer outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          );
        },
      },
    ],
    [router, deleteProduct, archiveProduct],
  );

  // Right-click context menu handler
  const handleContextMenu = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      product,
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Products Catalog"
        description="Manage product catalog items, prices, SKUs, and barcodes."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/products/archive" className="inline-flex items-center gap-1.5">
                <Archive className="w-4 h-4" />
                <span>View Archive</span>
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/products/new" className="inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 bg-cardard border border-border p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 w-full sm:max-w-md relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search SKU, Barcode, Name..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 rounded-lg pl-9 pr-4 bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            >
              Filters
            </Button>

            {/* Density toggle */}
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

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border mt-1">
            <div className="space-y-1">
              <label
                htmlFor="filter-status"
                className="text-[10px] font-semibold text-muted-foreground uppercase"
              >
                Status
              </label>
              <select
                id="filter-status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  setPage(1);
                }}
                className="w-full h-8 rounded-lg bg-background border border-border text-xs px-2.5 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="filter-category"
                className="text-[10px] font-semibold text-muted-foreground uppercase"
              >
                Category
              </label>
              <select
                id="filter-category"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                className="w-full h-8 rounded-lg bg-background border border-border text-xs px-2.5 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="filter-brand"
                className="text-[10px] font-semibold text-muted-foreground uppercase"
              >
                Brand
              </label>
              <select
                id="filter-brand"
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setPage(1);
                }}
                className="w-full h-8 rounded-lg bg-background border border-border text-xs px-2.5 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

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
                onClick={handleBulkArchive}
                leftIcon={<Archive className="w-3.5 h-3.5 text-amber-500" />}
                className="text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
              >
                Bulk Archive
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

      {/* Error state */}
      {isError && (
        <div className="border border-destructive/20 rounded-xl bg-backgroundestructive/5 p-4 text-sm text-destructive flex items-center justify-between">
          <span>Error loading products: {error?.message || 'Unknown network error.'}</span>
          <Button
            size="xs"
            variant="outline"
            onClick={() => void refetch()}
            leftIcon={<RefreshCw className="w-3 h-3" />}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Data Table */}
      <div
        onContextMenu={(e) => {
          const target = e.target as HTMLElement;
          const tr = target.closest('tr');
          if (tr) {
            const rowIndex = tr.rowIndex - 1; // header offset
            if (data?.data && data.data[rowIndex]) {
              handleContextMenu(e, data.data[rowIndex]!);
            }
          }
        }}
        onClick={() => setContextMenu(null)}
      >
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
          emptyTitle="No products found"
          emptyDescription="Get started by creating a new product."
          className={cn(density === 'compact' && '[&_td]:py-1.5 [&_th]:py-2')}
        />
      </div>

      {/* Context Menu Overlay */}
      {contextMenu && (
        <div
          className="fixed z-[9999] rounded-xl border border-border bg-popover p-1.5 shadow-xl w-44 animate-scale-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-xs h-8"
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            onClick={() => {
              setContextMenu(null);
              router.push(`/products/${contextMenu.product.id}`);
            }}
          >
            View details
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-xs h-8"
            leftIcon={<Edit className="w-3.5 h-3.5" />}
            onClick={() => {
              setContextMenu(null);
              router.push(`/products/${contextMenu.product.id}/edit`);
            }}
          >
            Edit Product
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-xs h-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
            leftIcon={<Archive className="w-3.5 h-3.5" />}
            onClick={() => {
              setContextMenu(null);
              archiveProduct(contextMenu.product.id);
            }}
          >
            Archive Product
          </Button>
          <hr className="my-1 border-border" />
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-xs h-8 text-destructive hover:bg-backgroundestructive/10"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => {
              setContextMenu(null);
              if (confirm('Delete this product?')) {
                deleteProduct(contextMenu.product.id);
              }
            }}
          >
            Delete Product
          </Button>
        </div>
      )}
    </PageContainer>
  );
}

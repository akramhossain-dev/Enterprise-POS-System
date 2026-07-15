'use client';

import * as React from 'react';
import Link from 'next/link';
import { Archive, RefreshCw, Search, Eye } from 'lucide-react';
import { useProducts, useRestoreProduct } from '@/hooks/use-product';
import { useWarehouses } from '@/hooks/use-warehouse';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { DataTable } from '@/components/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { Product } from '@/types/product';
import type { Warehouse } from '@/types/warehouse';
import { toast } from 'sonner';

export default function ArchivedInventoryPage() {
  const [pq, setPq] = React.useState('');
  const [wq, setWq] = React.useState('');
  const [productPage, setProductPage] = React.useState(1);
  const [warehousePage, setWarehousePage] = React.useState(1);

  // Queries - fetch DISCONTINUED products and INACTIVE warehouses
  const {
    data: productsResponse,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useProducts({
    page: productPage,
    limit: 10,
    q: pq || undefined,
    status: 'DISCONTINUED',
  });

  const {
    data: warehousesResponse,
    isLoading: warehousesLoading,
    refetch: refetchWarehouses,
  } = useWarehouses({
    page: warehousePage,
    limit: 10,
    q: wq || undefined,
    status: 'INACTIVE',
  });

  const restoreProductMutation = useRestoreProduct();

  const handleRestoreProduct = async (id: string) => {
    try {
      await restoreProductMutation.mutateAsync(id);
      void refetchProducts();
    } catch {}
  };

  const archivedProducts = productsResponse?.data || [];
  const archivedWarehouses = (warehousesResponse?.data || []).filter(
    (w) => w.status === 'INACTIVE',
  );

  const productColumns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">SKU: {row.original.sku || 'N/A'}</span>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => row.original.category?.name || '—',
    },
    {
      accessorKey: 'purchasePrice',
      header: 'Cost Price',
      cell: ({ row }) => `$${Number(row.original.purchasePrice).toFixed(2)}`,
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Sell Price',
      cell: ({ row }) => `$${Number(row.original.sellingPrice).toFixed(2)}`,
    },
    {
      id: 'status',
      header: 'Status',
      cell: () => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          DISCONTINUED
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRestoreProduct(row.original.id)}
          disabled={restoreProductMutation.isPending}
          className="text-xs"
        >
          Restore Item
        </Button>
      ),
    },
  ];

  const warehouseColumns: ColumnDef<Warehouse>[] = [
    {
      accessorKey: 'name',
      header: 'Warehouse Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">Code: {row.original.code}</span>
        </div>
      ),
    },
    {
      accessorKey: 'managerName',
      header: 'Manager',
      cell: ({ row }) => row.original.managerName || '—',
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => row.original.address || '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: () => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/20">
          INACTIVE
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
        title="Archived Inventory Elements"
        description="Review discontinued product files or decommissioned warehouse depots to ensure auditing and asset history records stay intact."
        actions={
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-muted-foreground" />
          </div>
        }
      />

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-muted/40 border border-border p-1 rounded-xl w-full sm:w-auto">
          <TabsTrigger value="products" className="rounded-lg text-xs font-medium px-4 py-2">
            Discontinued Products ({archivedProducts.length})
          </TabsTrigger>
          <TabsTrigger value="warehouses" className="rounded-lg text-xs font-medium px-4 py-2">
            Inactive Warehouses ({archivedWarehouses.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB: DISCONTINUED PRODUCTS */}
        <TabsContent value="products">
          <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discontinued..."
                  value={pq}
                  onChange={(e) => {
                    setPq(e.target.value);
                    setProductPage(1);
                  }}
                  className="pl-9 bg-muted/20 border-border"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetchProducts()}
                className="h-9 px-3"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {productsLoading ? (
              <TableSkeleton columns={6} rows={5} />
            ) : (
              <DataTable
                columns={productColumns}
                data={archivedProducts}
                totalCount={productsResponse?.meta?.total ?? 0}
                page={productPage}
                pageSize={10}
                onPageChange={setProductPage}
                emptyTitle="No discontinued products"
                emptyDescription="Discontinued catalog products will display here."
              />
            )}
          </div>
        </TabsContent>

        {/* TAB: INACTIVE WAREHOUSES */}
        <TabsContent value="warehouses">
          <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inactive depots..."
                  value={wq}
                  onChange={(e) => {
                    setWq(e.target.value);
                    setWarehousePage(1);
                  }}
                  className="pl-9 bg-muted/20 border-border"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetchWarehouses()}
                className="h-9 px-3"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {warehousesLoading ? (
              <TableSkeleton columns={5} rows={5} />
            ) : (
              <DataTable
                columns={warehouseColumns}
                data={archivedWarehouses}
                totalCount={archivedWarehouses.length}
                page={warehousePage}
                pageSize={10}
                onPageChange={setWarehousePage}
                emptyTitle="No inactive warehouses"
                emptyDescription="Inactive depots will show up here."
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

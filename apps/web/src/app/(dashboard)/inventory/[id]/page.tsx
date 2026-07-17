'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Barcode,
  Building,
  DollarSign,
  History,
  Layers,
  Package,
  ShieldCheck,
  TrendingUp,
  Warehouse as WarehouseIcon,
  AlertTriangle,
  FileDown,
} from 'lucide-react';
import {
  useInventoryRecord,
  useInventoryLedger,
  useBatches,
  useSerials,
  useUpdateMinStock,
} from '@/hooks/use-inventory';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StockStatusBadge } from '@/components/inventory/stock-status-badge';
import { ExpiryBadge } from '@/components/inventory/expiry-badge';
import { StockTimeline } from '@/components/inventory/stock-timeline';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export default function InventoryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params['id'] as string;

  // Primary Query
  const { data: inventory, isLoading, error } = useInventoryRecord(id);

  // Sub-queries enabled when inventory is fetched
  const warehouseId = inventory?.warehouseId;
  const productId = inventory?.productId;

  const { data: ledgerResponse, isLoading: ledgerLoading } = useInventoryLedger(
    warehouseId && productId ? { warehouseId, q: inventory.product.sku || undefined } : undefined,
  );

  const { data: batchesResponse, isLoading: batchesLoading } = useBatches(
    warehouseId ? { warehouseId } : undefined,
  );

  const { data: serialsResponse, isLoading: serialsLoading } = useSerials(
    warehouseId ? { warehouseId } : undefined,
  );

  // Filter batches & serials to match current product
  const batches = React.useMemo(() => {
    if (!batchesResponse?.data || !productId) return [];
    return batchesResponse.data.filter((b) => b.productId === productId);
  }, [batchesResponse, productId]);

  const serials = React.useMemo(() => {
    if (!serialsResponse?.data || !productId) return [];
    return serialsResponse.data.filter((s) => s.productId === productId);
  }, [serialsResponse, productId]);

  const ledgerMovements = ledgerResponse?.data || [];

  const handleExportReport = () => {
    toast.info('Exporting asset ledger history (UI Foundation)...');
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  if (error || !inventory) {
    return (
      <PageContainer>
        <div className="text-center py-16 bg-cardard border rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">Inventory Record Not Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The requested stock detail route does not contain a valid record or you lack
            permissions.
          </p>
          <Link href="/inventory/stock" className="inline-block mt-4">
            <Button size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Stock list
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const available = Number(inventory.availableQuantity);
  const reserved = Number(inventory.reservedQuantity);
  const currentStock = available + reserved;
  const avgCost = Number(inventory.averageCost);
  const assetValuation = available * avgCost;

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/inventory/stock">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Stock Directory
          </Button>
        </Link>
      </div>

      <PageHeader
        title={inventory.product?.name ?? 'Inventory Record'}
        description={`Audit record details for SKU: ${inventory.product?.sku || 'N/A'} at depot facility: ${inventory.warehouse?.name || 'N/A'}`}
        actions={
          <Button variant="outline" size="sm" onClick={handleExportReport} className="gap-1.5">
            <FileDown className="w-4 h-4" /> Export Audit Log
          </Button>
        }
      />

      {/* Quick Metrics Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="shadow-sm border-border bg-cardard">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current Quantity
              </p>
              <h3 className="text-xl font-bold text-foreground">{currentStock.toFixed(2)}</h3>
              <p className="text-[10px] text-muted-foreground">Available + Reserved</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Package className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-cardard">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Stock Valuation
              </p>
              <h3 className="text-xl font-bold text-emerald-500">
                ${assetValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Avail. Qty &times; Avg Cost (${avgCost.toFixed(2)})
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-cardard">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Reserve Ratio
              </p>
              <h3 className="text-xl font-bold text-amber-500">
                {currentStock > 0 ? ((reserved / currentStock) * 100).toFixed(0) : 0}%
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {reserved.toFixed(2)} units reserved for sales
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-cardard">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Safety Status
              </p>
              <div className="mt-1">
                <StockStatusBadge
                  availableQuantity={available}
                  minimumQuantity={Number(inventory.minimumQuantity)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Min limit: {Number(inventory.minimumQuantity).toFixed(0)} units
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs list */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/40 border border-border p-1 rounded-xl w-full sm:w-auto">
          <TabsTrigger value="overview" className="rounded-lg text-xs font-medium px-4 py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-xs font-medium px-4 py-2">
            Ledger Activities ({ledgerMovements.length})
          </TabsTrigger>
          <TabsTrigger value="batches" className="rounded-lg text-xs font-medium px-4 py-2">
            Batches ({batches.length})
          </TabsTrigger>
          <TabsTrigger value="serials" className="rounded-lg text-xs font-medium px-4 py-2">
            Serials ({serials.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product card info */}
            <Card className="shadow-sm border-border">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" /> Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Product Name</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {inventory.product?.name || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">SKU Code</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {inventory.product?.sku || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Barcode ID</p>
                    <p className="font-medium text-foreground mt-0.5 flex items-center gap-1">
                      <Barcode className="w-3.5 h-3.5 text-muted-foreground" />
                      {inventory.product?.barcode || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Category</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {inventory.product?.category?.name || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Purchase Price</p>
                    <p className="font-medium text-foreground mt-0.5">
                      ${Number(inventory.product?.purchasePrice || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Retail Selling Price</p>
                    <p className="font-medium text-foreground mt-0.5">
                      ${Number(inventory.product?.sellingPrice || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Default Unit Type</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {inventory.product?.unit?.name} ({inventory.product?.unit?.shortName})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Catalog Status</p>
                    <p className="font-semibold mt-0.5">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${inventory.product?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      />
                      {inventory.product?.status}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warehouse info */}
            <Card className="shadow-sm border-border">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <WarehouseIcon className="w-4 h-4 text-indigo-500" /> Warehouse Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Warehouse Name</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {inventory.warehouse?.name || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Facility Code</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {inventory.warehouse?.code || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Linked Branch Office</p>
                    <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-muted-foreground" />
                      {inventory.warehouse?.branch?.name || 'Main branch'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Warehouse Status</p>
                    <p className="font-semibold mt-0.5">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${inventory.warehouse?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      />
                      {inventory.warehouse?.status}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground uppercase">
                      Street Location Address
                    </p>
                    <p className="text-foreground mt-0.5">
                      {inventory.warehouse?.address || 'No address logged'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Logs */}
            <Card className="shadow-sm border-border md:col-span-2">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Audit Log Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-xs text-muted-foreground space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <p>
                    <strong>Database Record ID:</strong> {inventory.id}
                  </p>
                  <p>
                    <strong>First Opening Stock Date:</strong>{' '}
                    {inventory.hasOpeningStock ? 'Yes' : 'No opening stock logged'}
                  </p>
                  <p>
                    <strong>First Created At:</strong>{' '}
                    {new Date(inventory.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Last Updated At:</strong>{' '}
                    {new Date(inventory.updatedAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: HISTORY */}
        <TabsContent value="history">
          <Card className="shadow-sm border-border bg-cardard">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Comprehensive Stock History Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {ledgerLoading ? (
                <div className="py-8 space-y-6 relative border-l border-border pl-6 ml-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                      <div className="h-10 bg-muted rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <StockTimeline movements={ledgerMovements} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: BATCHES */}
        <TabsContent value="batches">
          <Card className="shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" /> Active Tracking Batches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {batchesLoading ? (
                <TableSkeleton columns={5} rows={3} />
              ) : batches.length > 0 ? (
                <div className="overflow-x-auto text-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold text-xs text-left uppercase tracking-wider">
                        <th className="p-4">Batch Number</th>
                        <th className="p-4">Mfg. Date</th>
                        <th className="p-4">Expiry Date</th>
                        <th className="p-4">Quantity</th>
                        <th className="p-4">Expiry Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((batch) => (
                        <tr
                          key={batch.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30"
                        >
                          <td className="p-4 font-semibold text-foreground">{batch.batchNumber}</td>
                          <td className="p-4 text-muted-foreground">
                            {batch.manufacturingDate
                              ? new Date(batch.manufacturingDate).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {batch.expiryDate
                              ? new Date(batch.expiryDate).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="p-4 font-bold text-foreground">
                            {Number(batch.quantity).toFixed(2)}
                          </td>
                          <td className="p-4">
                            <ExpiryBadge expiryDate={batch.expiryDate} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-muted/20 border border-dashed rounded-lg m-6">
                  <p className="text-sm text-muted-foreground">
                    No batch tracking lists configured for this item.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: SERIALS */}
        <TabsContent value="serials">
          <Card className="shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" /> Tracked Unique Serial Numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {serialsLoading ? (
                <TableSkeleton columns={4} rows={3} />
              ) : serials.length > 0 ? (
                <div className="overflow-x-auto text-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold text-xs text-left uppercase tracking-wider">
                        <th className="p-4">Serial Number</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Assigned Cust. (Foundation)</th>
                        <th className="p-4">Warranty (Foundation)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serials.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30"
                        >
                          <td className="p-4 font-mono font-semibold text-foreground">
                            {s.serialNumber}
                          </td>
                          <td className="p-4">
                            <span
                              className={cn(
                                'text-xs font-semibold px-2 py-0.5 rounded-full border',
                                s.status === 'AVAILABLE' &&
                                  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                                s.status === 'SOLD' &&
                                  'bg-blue-500/10 text-blue-500 border-blue-500/20',
                                s.status === 'DAMAGED' &&
                                  'bg-rose-500/10 text-rose-500 border-rose-500/20',
                                s.status === 'LOST' &&
                                  'bg-rose-500/10 text-rose-500 border-rose-500/20',
                                s.status === 'RETURNED' &&
                                  'bg-amber-500/10 text-amber-500 border-amber-500/20',
                              )}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {s.assignedCustomer?.name ?? '—'}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {s.warrantyExpiry
                              ? new Date(s.warrantyExpiry).toLocaleDateString()
                              : 'No Warranty'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-muted/20 border border-dashed rounded-lg m-6">
                  <p className="text-sm text-muted-foreground">
                    No tracking serials registered for this product.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

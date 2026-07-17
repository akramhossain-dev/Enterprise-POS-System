'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Archive,
  Barcode as BarcodeIcon,
  Sparkles,
  History,
  ShoppingBag,
  Truck,
  Calendar,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { useProduct, useDeleteProduct, useArchiveProduct } from '@/hooks/use-product';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/utils/format';
import { BarcodeWidget } from '@/components/product/barcode-widget';
import { toast } from 'sonner';

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const router = useRouter();
  const { id } = React.use(params);

  const { data: product, isLoading, isError, error } = useProduct(id);
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: archiveProduct } = useArchiveProduct();

  const [activeImage, setActiveImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (product) {
      setActiveImage(product.image || product.images?.[0]?.url || null);
    }
  }, [product]);

  const handleDelete = () => {
    if (confirm('Delete this product permanently?')) {
      deleteProduct(id, {
        onSuccess: () => {
          router.push('/products');
        },
      });
    }
  };

  const handleArchive = () => {
    if (confirm('Archive/discontinue this product?')) {
      archiveProduct(id, {
        onSuccess: () => {
          router.push('/products');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground">Loading product details...</span>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <PageContainer>
        <div className="border border-destructive/20 rounded-xl bg-backgroundestructive/5 p-5 text-center">
          <p className="text-sm text-destructive font-semibold">Error loading product</p>
          <p className="text-xs text-muted-foreground mt-1">
            {error?.message || 'The requested product could not be found.'}
          </p>
          <Button size="sm" className="mt-4" asChild>
            <Link href="/products">Back to list</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Margin calculation
  const profit = product.sellingPrice - product.purchasePrice;
  const marginPct = product.sellingPrice > 0 ? (profit / product.sellingPrice) * 100 : 0;

  return (
    <PageContainer>
      {/* Back breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/products">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to catalog</span>
      </div>

      {/* Header */}
      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku || '—'} · Barcode: ${product.barcode || '—'}`}
        actions={
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" asChild>
              <Link
                href={`/products/${product.id}/edit`}
                className="inline-flex items-center gap-1.5"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit</span>
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-amber-500 hover:bg-amber-500/10 border-amber-500/20"
              leftIcon={<Archive className="w-4 h-4" />}
              onClick={handleArchive}
            >
              Archive
            </Button>
            <Button
              size="sm"
              variant="destructive"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image Gallery + General Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Gallery */}
          <div className="rounded-xl border border-border bg-cardard p-5 space-y-4">
            <h3 className="font-semibold text-base text-foreground">Product Gallery</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Main Image Display */}
              <div className="md:col-span-8 aspect-video rounded-lg border overflow-hidden bg-muted flex items-center justify-center relative">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">No image available</span>
                  </div>
                )}
              </div>

              {/* Thumbnails grid */}
              <div className="md:col-span-4 flex md:flex-col gap-2 overflow-x-auto max-h-[300px]">
                {product.images && product.images.length > 0 ? (
                  product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.url)}
                      className={`relative aspect-video rounded-md overflow-hidden border transition-all flex-shrink-0 w-24 md:w-full ${
                        activeImage === img.url
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground text-center p-4 border border-dashed rounded-md w-full">
                    No extra thumbnails
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Analysis */}
          <div className="rounded-xl border border-border bg-cardard p-5 space-y-4">
            <h3 className="font-semibold text-base text-foreground">Financial & Margin Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/40 p-4 border border-border">
                <span className="text-xs text-muted-foreground uppercase font-medium">
                  Cost Price
                </span>
                <p className="text-xl font-bold text-foreground mt-1 tabular-nums">
                  {formatCurrency(product.purchasePrice)}
                </p>
              </div>

              <div className="rounded-lg bg-muted/40 p-4 border border-border">
                <span className="text-xs text-muted-foreground uppercase font-medium">
                  Selling Price
                </span>
                <p className="text-xl font-bold text-primary mt-1 tabular-nums">
                  {formatCurrency(product.sellingPrice)}
                </p>
              </div>

              <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                <span className="text-xs text-primary font-medium uppercase">Profit Margin</span>
                <p className="text-xl font-bold text-primary mt-1 tabular-nums">
                  {formatCurrency(profit)} ({marginPct.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>

          {/* History Stubs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purchase History */}
            <div className="rounded-xl border border-border bg-cardard p-5 space-y-3">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-violet-500" />
                Recent Purchases
              </h4>
              <div className="text-xs text-muted-foreground text-center py-8 border border-dashed rounded-lg bg-muted/20">
                No purchase transactions recorded.
              </div>
            </div>

            {/* Sales History */}
            <div className="rounded-xl border border-border bg-cardard p-5 space-y-3">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
                Recent Sales
              </h4>
              <div className="text-xs text-muted-foreground text-center py-8 border border-dashed rounded-lg bg-muted/20">
                No sales transactions recorded.
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Classification, Barcode, Audit Info */}
        <div className="space-y-6">
          {/* Status & Catalog */}
          <div className="rounded-xl border border-border bg-cardard p-5 space-y-4">
            <h3 className="font-semibold text-base text-foreground">Catalog Context</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {product.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-xs text-muted-foreground">Category</span>
                <span className="text-xs font-semibold text-foreground">
                  {product.category?.name || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-xs text-muted-foreground">Brand</span>
                <span className="text-xs font-semibold text-foreground">
                  {product.brand?.name || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-xs text-muted-foreground">Unit</span>
                <span className="text-xs font-semibold text-foreground">
                  {product.unit?.name} ({product.unit?.shortName})
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-muted-foreground">Tax Code</span>
                <span className="text-xs font-semibold text-foreground">
                  {product.tax ? `${product.tax.name} (${product.tax.percentage}%)` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Barcode preview and printing */}
          {product.barcode && (
            <BarcodeWidget
              barcode={product.barcode}
              name={product.name}
              price={product.sellingPrice}
            />
          )}

          {/* System Audit Information */}
          <div className="rounded-xl border border-border bg-cardard p-5 space-y-4">
            <h3 className="font-semibold text-base text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Audit Trail
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium text-foreground">{formatDate(product.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium text-foreground">{formatDate(product.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit, Globe, Building2, Info, ShoppingBag, AlertCircle } from 'lucide-react';
import { useBrand } from '@/hooks/use-catalog';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';

interface BrandDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function BrandDetailsPage({ params }: BrandDetailsPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: brand, isLoading, isError } = useBrand(id);

  if (isLoading) {
    return (
      <PageContainer narrow>
        <div className="space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !brand) {
    return (
      <PageContainer narrow>
        <div className="text-center py-12 rounded-xl border border-border bg-card shadow-xs">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h3 className="font-semibold text-lg text-foreground mt-4">Brand Not Found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            The brand may have been permanently deleted or does not exist.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/products/brands">Return to Brands</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/products/brands">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <span className="text-sm font-medium text-muted-foreground">Brands</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Edit className="w-4 h-4" />}
          onClick={() => router.push(`/products/brands/${brand.id}/edit`)}
        >
          Edit Brand
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">{brand.name}</h2>
                </div>
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{brand.website}</span>
                  </a>
                )}
              </div>
              <Badge variant={brand.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {brand.status}
              </Badge>
            </div>

            {brand.description && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Description
                </h4>
                <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-4 rounded-lg">
                  {brand.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
              {/* Country */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Country of Origin
                </h4>
                <span className="text-sm text-foreground font-medium">{brand.country || '—'}</span>
              </div>

              {/* Created At */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Registered Date
                </h4>
                <span className="text-sm text-foreground">{formatDate(brand.createdAt ?? '')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Media Card & Linked Stats */}
        <div className="space-y-6">
          {/* Logo Brand Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm text-foreground">Brand Logo</h3>
            {brand.logo ? (
              <div className="aspect-square w-32 mx-auto rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center p-2">
                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="aspect-square w-32 mx-auto rounded-xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground text-center p-4">
                No custom brand logo URL provided.
              </div>
            )}
          </div>

          {/* Connected Inventory Stats */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm text-foreground">Catalog Context</h3>

            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">Linked Products</p>
                <p className="text-xl font-bold text-foreground">{brand._count?.products ?? 0}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-primary/30" />
            </div>

            <div className="rounded-lg bg-info/5 border border-info/10 p-3 flex gap-2 items-start text-xs text-info-foreground">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Products mapped to this brand can be filtered inside the products dashboard list.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

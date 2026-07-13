'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit, Ruler, Info, ShoppingBag, AlertCircle } from 'lucide-react';
import { useUnit, useUnitsList } from '@/hooks/use-catalog';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';

interface UnitDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function UnitDetailsPage({ params }: UnitDetailsPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: unit, isLoading, isError } = useUnit(id);
  const { data: allUnitsData } = useUnitsList({ limit: 1000 });
  const allUnits = allUnitsData?.data ?? [];

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

  if (isError || !unit) {
    return (
      <PageContainer narrow>
        <div className="text-center py-12 rounded-xl border border-border bg-card shadow-xs">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h3 className="font-semibold text-lg text-foreground mt-4">Unit Not Found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            The unit may have been permanently deleted or does not exist.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/products/units">Return to Units</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Find parent base unit and sub-derived units
  const baseUnit = unit.baseUnitId ? allUnits.find((u) => u.id === unit.baseUnitId) : null;
  const derivedUnits = allUnits.filter((u) => u.baseUnitId === unit.id);

  return (
    <PageContainer narrow>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/products/units">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <span className="text-sm font-medium text-muted-foreground">Units</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Edit className="w-4 h-4" />}
          onClick={() => router.push(`/products/units/${unit.id}/edit`)}
          asChild
        >
          <Link href={`/products/units/${unit.id}/edit`}>Edit Unit</Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">
                    {unit.name} ({unit.shortName})
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground font-mono">ID: {unit.id}</p>
              </div>
              <Badge variant={unit.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {unit.status}
              </Badge>
            </div>

            {unit.description && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Description
                </h4>
                <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-4 rounded-lg">
                  {unit.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
              {/* Base Unit */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Base Unit (Parent)
                </h4>
                {baseUnit ? (
                  <Link
                    href={`/products/units/${baseUnit.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {baseUnit.name} ({baseUnit.shortName})
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">None (Is Base Unit)</span>
                )}
              </div>

              {/* Conversion Ratio */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Conversion Ratio
                </h4>
                {unit.baseUnitId &&
                unit.conversionRatio !== undefined &&
                unit.conversionRatio !== null ? (
                  <span className="text-sm font-mono text-foreground font-semibold">
                    {Number(unit.conversionRatio).toFixed(4)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">1.0000 (Base Unit)</span>
                )}
              </div>
            </div>

            {/* Derived Units */}
            <div className="space-y-3 pt-6 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Derived Child Units ({derivedUnits.length})
              </h4>
              {derivedUnits.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {derivedUnits.map((derived) => (
                    <Link
                      key={derived.id}
                      href={`/products/units/${derived.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/20 hover:bg-muted/10 transition-all text-sm text-foreground font-medium group"
                    >
                      <Ruler className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      <span>
                        {derived.name} ({derived.shortName})
                      </span>
                      <span className="ml-auto font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        x{Number(derived.conversionRatio).toFixed(1)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  No child derived units configured.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Formula Equation Card & Linked Stats */}
        <div className="space-y-6">
          {/* Formula Equation Card */}
          {baseUnit && unit.conversionRatio && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <h3 className="font-semibold text-sm text-foreground">Unit Equation</h3>
              <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-center space-y-1">
                <p className="text-xs text-muted-foreground">Conversion Relation</p>
                <p className="text-lg font-bold text-primary font-mono">
                  1 {unit.shortName} = {Number(unit.conversionRatio).toFixed(2)}{' '}
                  {baseUnit.shortName}
                </p>
              </div>
            </div>
          )}

          {/* Connected Inventory Stats */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm text-foreground">Catalog Context</h3>

            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">Linked Products</p>
                <p className="text-xl font-bold text-foreground">{unit._count?.products ?? 0}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-primary/30" />
            </div>

            <div className="rounded-lg bg-info/5 border border-info/10 p-3 flex gap-2 items-start text-xs text-info-foreground">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                This unit measures stock levels, purchase packages, and sale registers for linked
                products.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

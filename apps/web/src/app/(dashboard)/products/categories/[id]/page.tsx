'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit, Layers, Folder, Info, Sparkles, AlertCircle } from 'lucide-react';
import { useCategory, useCategoriesList } from '@/hooks/use-catalog';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function CategoryDetailsPage({ params }: CategoryDetailsPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: category, isLoading, isError } = useCategory(id);
  const { data: allCategoriesData } = useCategoriesList({ limit: 1000 });
  const allCategories = allCategoriesData?.data ?? [];

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

  if (isError || !category) {
    return (
      <PageContainer narrow>
        <div className="text-center py-12 rounded-xl border border-border bg-cardard shadow-xs">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h3 className="font-semibold text-lg text-foreground mt-4">Category Not Found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            The category may have been permanently deleted or does not exist.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/products/categories">Return to Categories</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Find parent and children
  const parent = category.parentId ? allCategories.find((c) => c.id === category.parentId) : null;
  const children = allCategories.filter((c) => c.parentId === category.id);

  return (
    <PageContainer narrow>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/products/categories">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <span className="text-sm font-medium text-muted-foreground">Categories</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Edit className="w-4 h-4" />}
          onClick={() => router.push(`/products/categories/${category.id}/edit`)}
        >
          Edit Category
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-cardard p-6 space-y-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">{category.name}</h2>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  Slug: /{category.slug || ''}
                </p>
              </div>
              <Badge variant={category.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {category.status}
              </Badge>
            </div>

            {category.description && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Description
                </h4>
                <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-4 rounded-lg">
                  {category.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
              {/* Parent */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Parent Category
                </h4>
                {parent ? (
                  <Link
                    href={`/products/categories/${parent.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {parent.name}
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">None (Root Category)</span>
                )}
              </div>

              {/* Display order */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Display Order
                </h4>
                <span className="text-sm font-mono text-foreground font-semibold">
                  {category.displayOrder ?? 0}
                </span>
              </div>
            </div>

            {/* Subcategories */}
            <div className="space-y-3 pt-6 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Subcategories ({children.length})
              </h4>
              {children.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/products/categories/${child.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/20 hover:bg-muted/10 transition-all text-sm text-foreground font-medium group"
                    >
                      <Folder className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      <span>{child.name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  No child subcategories nested.
                </span>
              )}
            </div>
          </div>

          {/* SEO Details Card */}
          {(category.seoTitle || category.seoDescription) && (
            <div className="rounded-xl border border-border bg-cardard p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">SEO Indexing Tags</h3>
              </div>

              <div className="space-y-4 text-sm">
                {category.seoTitle && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Title tag:</span>
                    <p className="font-medium text-foreground">{category.seoTitle}</p>
                  </div>
                )}

                {category.seoDescription && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Meta description:
                    </span>
                    <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg text-xs">
                      {category.seoDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Media Card & Linked Stats */}
        <div className="space-y-6">
          {/* Cover Media Card */}
          <div className="rounded-xl border border-border bg-cardard p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm text-foreground">Category Media</h3>
            {category.image ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                No custom banner image url provided.
              </div>
            )}

            {category.icon && (
              <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                  {category.icon.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Icon Class
                  </p>
                  <p className="text-xs font-mono font-medium text-foreground">{category.icon}</p>
                </div>
              </div>
            )}
          </div>

          {/* Connected Inventory Stats */}
          <div className="rounded-xl border border-border bg-cardard p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm text-foreground">Catalog Context</h3>

            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">Linked Products</p>
                <p className="text-xl font-bold text-foreground">
                  {category._count?.products ?? 0}
                </p>
              </div>
              <Layers className="w-8 h-8 text-primary/30" />
            </div>

            <div className="rounded-lg bg-info/5 border border-info/10 p-3 flex gap-2 items-start text-xs text-info-foreground">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>This category will be shown in the product editor dropdown selector list.</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

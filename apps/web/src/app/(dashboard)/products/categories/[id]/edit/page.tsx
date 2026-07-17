'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryForm, type CategoryFormValues } from '@/components/catalog/category-form';
import { useCategory, useUpdateCategory } from '@/hooks/use-catalog';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: category, isLoading, isError } = useCategory(id);
  const { mutate: updateCategory, isPending } = useUpdateCategory();

  const onSubmit = (values: CategoryFormValues) => {
    const payload = {
      name: values.name,
      slug: values.slug || null,
      parentId: values.parentId || null,
      description: values.description || null,
      image: values.image || null,
      icon: values.icon || null,
      displayOrder: values.displayOrder,
      status: values.status,
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
    };

    updateCategory(
      { id, payload },
      {
        onSuccess: () => {
          router.push('/products/categories');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <PageContainer narrow>
        <div className="space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !category) {
    return (
      <PageContainer narrow>
        <div className="text-center py-12 rounded-xl border border-border bg-card shadow-xs">
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

  return (
    <PageContainer narrow>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/products/categories/${category.id}`}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to details</span>
      </div>

      <PageHeader
        title={`Edit Category: ${category.name}`}
        description="Update category name, parent hierarchy, display order, metadata, or SEO configurations."
      />

      <div className="mt-6">
        <CategoryForm onSubmit={onSubmit} isPending={isPending} initialValues={category} />
      </div>
    </PageContainer>
  );
}

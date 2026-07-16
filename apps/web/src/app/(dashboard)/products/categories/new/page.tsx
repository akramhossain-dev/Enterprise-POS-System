'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CategoryForm, type CategoryFormValues } from '@/components/catalog/category-form';
import { useCreateCategory } from '@/hooks/use-catalog';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { useAuthStore } from '@/stores/auth.store';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parentId') ?? '';

  const { user } = useAuthStore();
  const { mutate: createCategory, isPending } = useCreateCategory();

  const onSubmit = (values: CategoryFormValues) => {
    if (!user?.workspaceId) {
      toast.error('Unable to create item: workspace not found. Please log in again.');
      return;
    }

    const payload = {
      companyId: user.workspaceId,
      name: values.name,
      slug: values.slug || undefined,
      parentId: values.parentId || undefined,
      description: values.description || undefined,
      image: values.image || undefined,
      icon: values.icon || undefined,
      displayOrder: values.displayOrder,
      status: values.status,
      seoTitle: values.seoTitle || undefined,
      seoDescription: values.seoDescription || undefined,
    };

    createCategory(payload, {
      onSuccess: () => {
        router.push('/products/categories');
      },
    });
  };

  const initialValues = parentId ? ({ parentId } as any) : undefined;

  return (
    <PageContainer narrow>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/products/categories">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to categories</span>
      </div>

      <PageHeader
        title="Add New Category"
        description="Configure details, parent structures, display ordering, and SEO parameters."
      />

      <div className="mt-6">
        <CategoryForm onSubmit={onSubmit} isPending={isPending} initialValues={initialValues} />
      </div>
    </PageContainer>
  );
}

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { BrandForm, type BrandFormValues } from '@/components/catalog/brand-form';
import { useBrand, useUpdateBrand } from '@/hooks/use-catalog';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface EditBrandPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBrandPage({ params }: EditBrandPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: brand, isLoading, isError } = useBrand(id);
  const { mutate: updateBrand, isPending } = useUpdateBrand();

  const onSubmit = (values: BrandFormValues) => {
    const payload = {
      name: values.name,
      logo: values.logo || null,
      website: values.website || null,
      country: values.country || null,
      description: values.description || null,
      status: values.status,
    };

    updateBrand(
      { id, payload },
      {
        onSuccess: () => {
          router.push('/products/brands');
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
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/products/brands/${brand.id}`}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to details</span>
      </div>

      <PageHeader
        title={`Edit Brand: ${brand.name}`}
        description="Update brand profiling parameters, logo imagery, website urls, and status configurations."
      />

      <div className="mt-6">
        <BrandForm onSubmit={onSubmit} isPending={isPending} initialValues={brand} />
      </div>
    </PageContainer>
  );
}

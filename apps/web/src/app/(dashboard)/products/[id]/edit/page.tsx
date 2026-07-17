'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm, type ProductFormValues } from '@/components/product/product-form';
import { useProduct, useUpdateProduct } from '@/hooks/use-product';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const { id } = React.use(params);

  const { data: product, isLoading, isError, error } = useProduct(id);
  const { mutate: updateProduct, isPending } = useUpdateProduct();

  const onSubmit = (values: ProductFormValues) => {
    const payload = {
      name: values.name,
      sku: values.sku || null,
      barcode: values.barcode || null,
      description: values.description || null,
      purchasePrice: values.purchasePrice,
      sellingPrice: values.sellingPrice,
      categoryId: values.categoryId || null,
      brandId: values.brandId || null,
      unitId: values.unitId,
      taxId: values.taxId || null,
      status: values.status,
      image: values.images?.find((img) => img.isPrimary)?.url || null,
    };

    updateProduct(
      { id, payload },
      {
        onSuccess: () => {
          router.push('/products');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <PageContainer narrow>
        <div className="border border-destructive/20 rounded-xl bg-destructive/5 p-5 text-center">
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

  return (
    <PageContainer narrow>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/products">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to catalog</span>
      </div>

      <PageHeader
        title={`Edit Product: ${product?.name}`}
        description="Update your product catalog item information, prices, classification, or gallery images."
      />

      {product && <ProductForm initialValues={product} onSubmit={onSubmit} isPending={isPending} />}
    </PageContainer>
  );
}

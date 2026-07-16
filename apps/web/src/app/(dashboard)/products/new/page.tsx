'use client';

import { useRouter } from 'next/navigation';
import { ProductForm, type ProductFormValues } from '@/components/product/product-form';
import { useCreateProduct } from '@/hooks/use-product';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { useAuthStore } from '@/stores/auth.store';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { mutate: createProduct, isPending } = useCreateProduct();

  const onSubmit = (values: ProductFormValues) => {
    if (!user?.workspaceId) {
      toast.error('Unable to create product: workspace not found. Please log in again.');
      return;
    }

    const payload = {
      companyId: user.workspaceId,
      name: values.name,
      sku: values.sku || undefined,
      barcode: values.barcode || undefined,
      description: values.description || undefined,
      purchasePrice: values.purchasePrice,
      sellingPrice: values.sellingPrice,
      categoryId: values.categoryId || undefined,
      brandId: values.brandId || undefined,
      unitId: values.unitId,
      taxId: values.taxId || undefined,
      status: values.status,
      // Select the primary image as main image URL
      image: values.images?.find((img) => img.isPrimary)?.url || undefined,
    };

    createProduct(payload, {
      onSuccess: () => {
        router.push('/products');
      },
    });
  };

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
        title="Add New Product"
        description="Create a new inventory catalog product item with pricing, units, and images."
      />

      <ProductForm onSubmit={onSubmit} isPending={isPending} />
    </PageContainer>
  );
}

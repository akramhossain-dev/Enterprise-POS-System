'use client';

import { useRouter } from 'next/navigation';
import { BrandForm, type BrandFormValues } from '@/components/catalog/brand-form';
import { useCreateBrand } from '@/hooks/use-catalog';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { useAuthStore } from '@/stores/auth.store';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewBrandPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { mutate: createBrand, isPending } = useCreateBrand();

  const onSubmit = (values: BrandFormValues) => {
    if (!user?.workspaceId) {
      console.error('No workspace ID found for the user');
      return;
    }

    const payload = {
      companyId: user.workspaceId,
      name: values.name,
      logo: values.logo || undefined,
      website: values.website || undefined,
      country: values.country || undefined,
      description: values.description || undefined,
      status: values.status,
    };

    createBrand(payload, {
      onSuccess: () => {
        router.push('/products/brands');
      },
    });
  };

  return (
    <PageContainer narrow>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/products/brands">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to brands</span>
      </div>

      <PageHeader
        title="Add New Brand"
        description="Establish brand properties, logos, website domains, and regions of manufacturing."
      />

      <div className="mt-6">
        <BrandForm onSubmit={onSubmit} isPending={isPending} />
      </div>
    </PageContainer>
  );
}

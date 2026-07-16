'use client';

import { useRouter } from 'next/navigation';
import { UnitForm, type UnitFormValues } from '@/components/catalog/unit-form';
import { useCreateUnit } from '@/hooks/use-catalog';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { useAuthStore } from '@/stores/auth.store';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewUnitPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { mutate: createUnit, isPending } = useCreateUnit();

  const onSubmit = (values: UnitFormValues) => {
    if (!user?.workspaceId) {
      toast.error('Unable to create item: workspace not found. Please log in again.');
      return;
    }

    const payload = {
      companyId: user.workspaceId,
      name: values.name,
      shortName: values.shortName,
      description: values.description || undefined,
      baseUnitId: values.baseUnitId || undefined,
      conversionRatio: values.conversionRatio ? Number(values.conversionRatio) : undefined,
      status: values.status,
    };

    createUnit(payload, {
      onSuccess: () => {
        router.push('/products/units');
      },
    });
  };

  return (
    <PageContainer narrow>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/products/units">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to units</span>
      </div>

      <PageHeader
        title="Add New Unit"
        description="Establish baseline units of inventory tracking and derived conversion ratio relationships."
      />

      <div className="mt-6">
        <UnitForm onSubmit={onSubmit} isPending={isPending} />
      </div>
    </PageContainer>
  );
}

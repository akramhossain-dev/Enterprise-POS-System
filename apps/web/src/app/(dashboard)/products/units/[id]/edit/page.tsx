'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { UnitForm, type UnitFormValues } from '@/components/catalog/unit-form';
import { useUnit, useUpdateUnit } from '@/hooks/use-catalog';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface EditUnitPageProps {
  params: Promise<{ id: string }>;
}

export default function EditUnitPage({ params }: EditUnitPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: unit, isLoading, isError } = useUnit(id);
  const { mutate: updateUnit, isPending } = useUpdateUnit();

  const onSubmit = (values: UnitFormValues) => {
    const payload = {
      name: values.name,
      shortName: values.shortName,
      description: values.description || null,
      baseUnitId: values.baseUnitId || null,
      conversionRatio: values.conversionRatio ? Number(values.conversionRatio) : null,
      status: values.status,
    };

    updateUnit(
      { id, payload },
      {
        onSuccess: () => {
          router.push('/products/units');
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

  return (
    <PageContainer narrow>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/products/units/${unit.id}`}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to details</span>
      </div>

      <PageHeader
        title={`Edit Unit: ${unit.name}`}
        description="Update unit tracking names, packaging symbols, parent base structures, or status."
      />

      <div className="mt-6">
        <UnitForm onSubmit={onSubmit} isPending={isPending} initialValues={unit} />
      </div>
    </PageContainer>
  );
}

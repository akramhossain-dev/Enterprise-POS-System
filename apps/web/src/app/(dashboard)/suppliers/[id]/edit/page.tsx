'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useSupplier, useUpdateSupplier } from '@/hooks/use-supplier';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SupplierForm } from '@/components/supplier/supplier-form';
import { SupplierFormSkeleton } from '@/components/supplier/supplier-form-skeleton';
import type { SupplierFormSchema } from '@/components/supplier/supplier-form';

export default function EditSupplierPage() {
  const params = useParams();
  const router = useRouter();
  const id = params['id'] as string;

  const { data: supplier, isLoading, error } = useSupplier(id);
  const updateSupplier = useUpdateSupplier();

  const handleSubmit = async (values: SupplierFormSchema) => {
    await updateSupplier.mutateAsync({
      id,
      payload: {
        companyName: values.companyName,
        contactPerson: values.contactPerson || null,
        phone: values.phone || null,
        email: values.email || null,
        website: values.website || null,
        taxNumber: values.taxNumber || null,
        creditLimit: values.creditLimit,
        openingBalance: values.openingBalance,
        status: values.status,
        notes: values.notes || null,
      },
    });
    router.push(`/suppliers/${id}`);
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
          <Link href={`/suppliers/${id}`}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Profile
          </Link>
        </Button>
        <PageHeader
          title="Edit Supplier"
          description={supplier ? `Editing ${supplier.companyName}` : 'Loading…'}
        />
      </div>

      <div className="max-w-4xl">
        {isLoading ? (
          <SupplierFormSkeleton />
        ) : error || !supplier ? (
          <div className="text-center py-16">
            <p className="text-sm text-destructive mb-4">Supplier not found</p>
            <Button variant="outline" onClick={() => router.push('/suppliers')}>
              Back to Suppliers
            </Button>
          </div>
        ) : (
          <SupplierForm
            supplier={supplier}
            onSubmit={handleSubmit}
            isPending={updateSupplier.isPending}
            submitLabel="Save Changes"
            onCancel={() => router.push(`/suppliers/${id}`)}
          />
        )}
      </div>
    </PageContainer>
  );
}

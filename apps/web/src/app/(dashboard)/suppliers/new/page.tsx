'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useCreateSupplier } from '@/hooks/use-supplier';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SupplierForm } from '@/components/supplier/supplier-form';
import type { SupplierFormSchema } from '@/components/supplier/supplier-form';

export default function NewSupplierPage() {
  const router = useRouter();
  const createSupplier = useCreateSupplier();

  const handleSubmit = async (values: SupplierFormSchema) => {
    const supplier = await createSupplier.mutateAsync({
      companyId: '', // resolved from auth context by middleware
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
      addresses: values.addressLine1
        ? [
            {
              label: 'Primary',
              addressLine1: values.addressLine1,
              city: values.city || undefined,
              country: values.country || undefined,
              isDefault: true,
            },
          ]
        : [],
    });
    router.push(`/suppliers/${supplier.id}`);
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
          <Link href="/suppliers">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Suppliers
          </Link>
        </Button>
        <PageHeader
          title="New Supplier"
          description="Add a new supplier to your procurement network"
        />
      </div>

      <div className="max-w-4xl">
        <SupplierForm
          onSubmit={handleSubmit}
          isPending={createSupplier.isPending}
          submitLabel="Create Supplier"
          onCancel={() => router.push('/suppliers')}
        />
      </div>
    </PageContainer>
  );
}

'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { useCustomer, useUpdateCustomer } from '@/hooks/use-customer';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { CustomerForm, type CustomerFormSchema } from '@/components/customer/customer-form';
import { CustomerFormSkeleton } from '@/components/customer/customer-form-skeleton';

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const { data: customer, isLoading, isError, refetch } = useCustomer(id);
  const { mutate: updateCustomer, isPending } = useUpdateCustomer();

  const onSubmit = (values: CustomerFormSchema) => {
    updateCustomer(
      {
        id,
        payload: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || null,
          email: values.email || null,
          dateOfBirth: values.dateOfBirth || null,
          gender: (values.gender as any) || null,
          creditLimit: values.creditLimit,
          openingBalance: values.openingBalance,
          status: values.status,
          notes: values.notes || null,
        },
      },
      {
        onSuccess: () => {
          router.push(`/customers/${id}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <PageContainer narrow>
        <CustomerFormSkeleton />
      </PageContainer>
    );
  }

  if (isError || !customer) {
    return (
      <PageContainer narrow>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-sm text-destructive">Failed to load customer.</p>
          <Button
            variant="outline"
            onClick={() => void refetch()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/customers/${id}`}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to profile</span>
      </div>

      <PageHeader
        title="Edit Customer"
        description={`Updating profile for ${customer.fullName} — #${customer.customerCode}`}
      />

      <CustomerForm
        customer={customer}
        onSubmit={onSubmit}
        isPending={isPending}
        submitLabel="Save Changes"
        onCancel={() => router.push(`/customers/${id}`)}
      />
    </PageContainer>
  );
}

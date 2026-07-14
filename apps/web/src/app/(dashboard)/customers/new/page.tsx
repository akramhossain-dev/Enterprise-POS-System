'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { CustomerForm, type CustomerFormSchema } from '@/components/customer/customer-form';
import { useCreateCustomer } from '@/hooks/use-customer';
import { useAuthStore } from '@/stores/auth.store';

export default function NewCustomerPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { mutate: createCustomer, isPending } = useCreateCustomer();

  const onSubmit = (values: CustomerFormSchema) => {
    if (!user?.workspaceId) return;

    const addresses = values.addressLine1
      ? [
          {
            label: 'Primary',
            addressLine1: values.addressLine1,
            city: values.city || undefined,
            country: values.country || undefined,
            isDefault: true,
          },
        ]
      : [];

    createCustomer(
      {
        companyId: user.workspaceId,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
        email: values.email || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: (values.gender as any) || undefined,
        creditLimit: values.creditLimit,
        openingBalance: values.openingBalance,
        status: values.status,
        notes: values.notes || undefined,
        addresses,
      },
      {
        onSuccess: (customer) => {
          router.push(`/customers/${customer.id}`);
        },
      },
    );
  };

  return (
    <PageContainer narrow>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/customers">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to customers</span>
      </div>

      <PageHeader
        title="Add New Customer"
        description="Create a new customer profile with contact info, credit settings, and address."
      />

      <CustomerForm
        onSubmit={onSubmit}
        isPending={isPending}
        onCancel={() => router.push('/customers')}
      />
    </PageContainer>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Save, Loader2, Store, Phone, MapPin } from 'lucide-react';
import { useBranch, useUpdateBranch } from '@/hooks/use-branch';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const branchSchema = z.object({
  name: z.string().min(1, 'Branch Name is required').max(255),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  openingDate: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type BranchFormValues = z.infer<typeof branchSchema>;

export default function EditBranchPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Queries
  const { data: branch, isLoading: isLoadingBranch } = useBranch(id);
  const updateMutation = useUpdateBranch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
  });

  // Reset form once branch loads
  React.useEffect(() => {
    if (branch) {
      reset({
        name: branch.name,
        phone: branch.phone || '',
        email: branch.email || '',
        address: branch.address || '',
        city: branch.metadata?.city || '',
        country: branch.metadata?.country || '',
        openingDate: branch.metadata?.openingDate ? branch.metadata.openingDate.split('T')[0] : '',
        status: branch.status,
      });
    }
  }, [branch, reset]);

  const onSubmit = async (values: BranchFormValues) => {
    const payload = {
      name: values.name,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
      status: values.status,
      metadata: {
        city: values.city || null,
        country: values.country || null,
        openingDate: values.openingDate || null,
      },
    };

    updateMutation.mutate({ id, payload });
  };

  if (isLoadingBranch) {
    return (
      <PageContainer>
        <div className="flex h-40 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading branch location credentials...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Edit Branch Location"
        description={`Modify storefront details for ${branch?.name}.`}
        actions={
          <Link href={`/branches/${id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ChevronLeft className="w-4 h-4" />
              Cancel
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl text-left">
        {/* Core Credentials */}
        <div className="rounded-2xl border border-border bg-cardard p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-base">Office Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Branch Office Name *"
                placeholder="e.g. Chicago Retail Outlet"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <Input
              label="Contact Phone"
              placeholder="e.g. +1 555-0102"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Contact Email"
              type="email"
              placeholder="e.g. chicago@enterprise-pos.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
        </div>

        {/* Location Specs */}
        <div className="rounded-2xl border border-border bg-cardard p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-base">Address & Placement</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Office Address
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 220 W Kinzie St, Chicago, IL"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                {...register('address')}
              />
            </div>

            <Input
              label="City"
              placeholder="e.g. Chicago"
              error={errors.city?.message}
              {...register('city')}
            />

            <Input
              label="Country"
              placeholder="e.g. USA"
              error={errors.country?.message}
              {...register('country')}
            />

            <Input
              label="Opening Date"
              type="date"
              error={errors.openingDate?.message}
              {...register('openingDate')}
            />

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Operational Status
              </label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href={`/branches/${id}`}>
            <Button variant="outline" type="button">
              Discard Changes
            </Button>
          </Link>
          <Button type="submit" disabled={updateMutation.isPending} className="gap-1.5">
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Branch Changes
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

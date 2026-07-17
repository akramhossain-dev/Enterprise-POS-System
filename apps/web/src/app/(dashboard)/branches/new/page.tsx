'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Save, Loader2, Store, Phone, MapPin } from 'lucide-react';
import { useCreateBranch } from '@/hooks/use-branch';
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

export default function NewBranchPage() {
  const router = useRouter();
  const createMutation = useCreateBranch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: '',
      openingDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    },
  });

  const onSubmit = async (values: BranchFormValues) => {
    const payload = {
      companyId: 'comp-default-uuid', // Default active company id context
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

    createMutation.mutate(payload);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Create Branch Office"
        description="Onboard a new physical storefront or commercial retail location."
        actions={
          <Link href="/branches">
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
          <Link href="/branches">
            <Button variant="outline" type="button">
              Discard
            </Button>
          </Link>
          <Button type="submit" disabled={createMutation.isPending} className="gap-1.5">
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Onboard Branch Location
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

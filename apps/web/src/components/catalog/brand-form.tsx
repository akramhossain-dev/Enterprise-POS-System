'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Brand } from '@/types/product';

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(255),
  logo: z.string().optional().or(z.literal('')),
  website: z
    .string()
    .url('Please enter a valid URL (e.g. https://brand.com)')
    .max(255)
    .optional()
    .or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type BrandFormValues = z.infer<typeof brandSchema>;

interface BrandFormProps {
  initialValues?: Brand;
  onSubmit: (values: BrandFormValues) => void;
  isPending: boolean;
}

// Simple list of countries for selector
const countriesList = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'South Korea',
  'China',
  'India',
  'Australia',
  'Brazil',
  'Mexico',
  'Singapore',
  'Vietnam',
  'Bangladesh',
];

export function BrandForm({ initialValues, onSubmit, isPending }: BrandFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      name: initialValues?.name ?? '',
      logo: initialValues?.logo ?? '',
      website: initialValues?.website ?? '',
      country: initialValues?.country ?? '',
      description: initialValues?.description ?? '',
      status: initialValues?.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    },
    mode: 'onBlur',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (Main details) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-cardard p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-base text-foreground">Brand Profile</h3>

            <div className="space-y-4">
              <Input
                {...register('name')}
                id="name"
                label="Brand Name"
                placeholder="Samsung, Apple, Nestlé..."
                required
                error={errors.name?.message}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  {...register('website')}
                  id="website"
                  label="Official Website"
                  placeholder="https://brand.com"
                  error={errors.website?.message}
                  rightElement={<Globe className="w-4 h-4 text-muted-foreground mr-1" />}
                />

                <div className="space-y-1.5">
                  <label
                    htmlFor="country"
                    className="block text-xs font-semibold text-muted-foreground uppercase"
                  >
                    Country of Origin
                  </label>
                  <select
                    {...register('country')}
                    id="country"
                    className="w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select Country</option>
                    {countriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-xs text-destructive mt-1">{errors.country.message}</p>
                  )}
                </div>
              </div>

              <Textarea
                {...register('description')}
                id="description"
                label="Description"
                placeholder="Brief details about the brand, history, catalog focus..."
                rows={5}
                error={errors.description?.message}
              />
            </div>
          </div>
        </div>

        {/* Right column (Settings & Actions) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-cardard p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-base text-foreground">Brand Settings</h3>

            <div className="space-y-4">
              {/* Status */}
              <div className="space-y-1.5">
                <label
                  htmlFor="status"
                  className="block text-xs font-semibold text-muted-foreground uppercase"
                >
                  Status
                </label>
                <select
                  {...register('status')}
                  id="status"
                  className="w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                {errors.status && (
                  <p className="text-xs text-destructive mt-1">{errors.status.message}</p>
                )}
              </div>

              {/* Logo URL */}
              <Input
                {...register('logo')}
                id="logo"
                label="Brand Logo URL"
                placeholder="https://example.com/logo.png"
                error={errors.logo?.message}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="default"
            loading={isPending}
            leftIcon={<Save className="w-4 h-4" />}
            className="w-full"
          >
            Save Brand
          </Button>
        </div>
      </div>
    </form>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Save, Loader2, Warehouse, User, Phone, MapPin, Layers } from 'lucide-react';
import { useWarehouse, useUpdateWarehouse } from '@/hooks/use-warehouse';
import { useBranches } from '@/hooks/use-branch';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const warehouseSchema = z.object({
  code: z.string().min(1, 'Warehouse code is required').max(20, 'Code cannot exceed 20 characters'),
  name: z.string().min(1, 'Warehouse name is required').max(255),
  branchId: z.string().min(1, 'Branch Location is required'),
  managerName: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  capacity: z.coerce.number().positive('Capacity must be greater than zero'),
  storageType: z.enum(['DRY', 'COLD', 'HAZARDOUS', 'CLIMATE_CONTROLLED']),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  description: z.string().optional().or(z.literal('')),
  isDefault: z.boolean().optional(),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

export default function EditWarehousePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Queries
  const { data: warehouse, isLoading: isLoadingWarehouse } = useWarehouse(id);
  const { data: branchesResponse } = useBranches();
  const branches = branchesResponse?.data || [];

  const updateMutation = useUpdateWarehouse();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
  });

  // Reset form once warehouse loads
  React.useEffect(() => {
    if (warehouse) {
      reset({
        code: warehouse.code,
        name: warehouse.name,
        branchId: warehouse.branchId || '',
        managerName: warehouse.managerName || '',
        phone: warehouse.phone || '',
        email: warehouse.email || '',
        address: warehouse.address || '',
        city: warehouse.city || '',
        country: warehouse.country || '',
        capacity: warehouse.metadata?.capacity || 5000,
        storageType: warehouse.metadata?.storageType || 'DRY',
        status: warehouse.status,
        description: warehouse.metadata?.description || '',
        isDefault: warehouse.isDefault,
      });
    }
  }, [warehouse, reset]);

  const onSubmit = async (values: WarehouseFormValues) => {
    const payload = {
      branchId: values.branchId,
      code: values.code,
      name: values.name,
      phone: values.phone || null,
      email: values.email || null,
      managerName: values.managerName || null,
      country: values.country || null,
      city: values.city || null,
      address: values.address || null,
      status: values.status,
      isDefault: values.isDefault === true,
      metadata: {
        capacity: Number(values.capacity),
        storageType: values.storageType,
        description: values.description || null,
        utilization: warehouse?.metadata?.utilization ?? 0, // Preserve utilization
      },
    };

    updateMutation.mutate({ id, payload });
  };

  if (isLoadingWarehouse) {
    return (
      <PageContainer>
        <div className="flex h-40 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading warehouse facility profile...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Edit Warehouse"
        description={`Modify storage placement specifications for ${warehouse?.name}.`}
        actions={
          <Link href={`/warehouses/${id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ChevronLeft className="w-4 h-4" />
              Cancel
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl text-left">
        {/* Basic Depot Credentials */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <Warehouse className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-base">Facility Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Warehouse Code *"
              placeholder="e.g. WH-NY-01"
              error={errors.code?.message}
              {...register('code')}
              disabled
            />
            <div className="md:col-span-2">
              <Input
                label="Warehouse Name *"
                placeholder="e.g. Manhattan Central Depot"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Branch Location *
              </label>
              <select
                {...register('branchId')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Branch Link...</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.branchId && (
                <p className="text-xs text-destructive mt-1">{errors.branchId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Storage Environment *
              </label>
              <select
                {...register('storageType')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="DRY">Dry Storage</option>
                <option value="COLD">Cold Storage</option>
                <option value="HAZARDOUS">Hazardous Cell</option>
                <option value="CLIMATE_CONTROLLED">Climate Controlled</option>
              </select>
            </div>

            <Input
              label="Total Storage Vol Capacity (m³) *"
              type="number"
              placeholder="e.g. 5000"
              error={errors.capacity?.message}
              {...register('capacity')}
            />
          </div>
        </div>

        {/* Manager Details */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-base">
              Facility Custodian / Manager
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Manager Full Name"
              placeholder="e.g. Jon Snow"
              error={errors.managerName?.message}
              {...register('managerName')}
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +1 555-0811"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. depotmanager@enterprise-pos.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
        </div>

        {/* Address and Geography */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-base">Geographic Address</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Residential / Street Address
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 750 Broadway Ave, Floor 3"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                {...register('address')}
              />
            </div>

            <Input
              label="City"
              placeholder="e.g. New York"
              error={errors.city?.message}
              {...register('city')}
            />

            <Input
              label="Country"
              placeholder="e.g. USA"
              error={errors.country?.message}
              {...register('country')}
            />

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Depot Status
              </label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-2 mt-2 bg-muted/30 p-3 rounded-lg">
              <input
                type="checkbox"
                id="isDefault"
                className="rounded text-primary focus:ring-primary h-4 w-4"
                {...register('isDefault')}
              />
              <label
                htmlFor="isDefault"
                className="text-xs text-foreground cursor-pointer select-none"
              >
                <strong>Set as Default Corporate Warehouse</strong> — System operations (like
                receipt intake) will prioritize this depot.
              </label>
            </div>

            <div className="md:col-span-3 pt-2">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Depot Operational Details
              </label>
              <textarea
                rows={3}
                placeholder="Add special description, safety ratings, ventilation logs, hazard licenses, or custom remarks..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                {...register('description')}
              />
            </div>
          </div>
        </div>

        {/* Submit Panel */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href={`/warehouses/${id}`}>
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
            Save Depot Changes
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

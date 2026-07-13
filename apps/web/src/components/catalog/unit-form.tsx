'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUnitsList } from '@/hooks/use-catalog';
import type { Unit } from '@/types/product';
import { useEffect } from 'react';

const unitSchema = z
  .object({
    name: z.string().min(1, 'Unit name is required').max(100),
    shortName: z.string().min(1, 'Short name is required').max(20),
    description: z.string().max(2000).optional().or(z.literal('')),
    baseUnitId: z.string().uuid().optional().or(z.literal('')),
    conversionRatio: z.coerce
      .number({ invalid_type_error: 'Conversion ratio must be a number' })
      .positive('Conversion ratio must be positive')
      .optional()
      .or(z.literal('')),
    status: z.enum(['ACTIVE', 'INACTIVE']),
  })
  .refine(
    (data) => {
      if (data.baseUnitId && !data.conversionRatio) {
        return false;
      }
      return true;
    },
    {
      message: 'Conversion ratio is required for derived units',
      path: ['conversionRatio'],
    },
  );

export type UnitFormValues = z.infer<typeof unitSchema>;

interface UnitFormProps {
  initialValues?: Unit;
  onSubmit: (values: UnitFormValues) => void;
  isPending: boolean;
}

export function UnitForm({ initialValues, onSubmit, isPending }: UnitFormProps) {
  // Fetch active units list to populate base unit selection
  const { data: unitsData } = useUnitsList({ limit: 1000, status: 'ACTIVE' });
  const units = unitsData?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema) as any,
    defaultValues: {
      name: initialValues?.name ?? '',
      shortName: initialValues?.shortName ?? '',
      description: initialValues?.description ?? '',
      baseUnitId: initialValues?.baseUnitId ?? '',
      conversionRatio: initialValues?.conversionRatio ?? '',
      status: initialValues?.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    },
    mode: 'onBlur',
  });

  const baseUnitId = watch('baseUnitId');
  const shortNameValue = watch('shortName');
  const conversionRatioValue = watch('conversionRatio');

  // Find base unit object to show live ratio preview
  const selectedBaseUnit = units.find((u) => u.id === baseUnitId);

  useEffect(() => {
    // If baseUnitId is cleared, clear conversion ratio
    if (!baseUnitId) {
      setValue('conversionRatio', '');
    }
  }, [baseUnitId, setValue]);

  // Filter out self from selection
  const baseUnitOptions = units.filter(
    (u) => u.id !== initialValues?.id && !u.baseUnitId, // Base units shouldn't be nested infinitely
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (Core inputs) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-base text-foreground">Unit Profile</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    {...register('name')}
                    id="name"
                    label="Unit Name"
                    placeholder="Kilogram, Box, Pieces, Carton..."
                    required
                    error={errors.name?.message}
                  />
                </div>
                <div>
                  <Input
                    {...register('shortName')}
                    id="shortName"
                    label="Short Name (Symbol)"
                    placeholder="kg, box, pcs, ctn..."
                    required
                    error={errors.shortName?.message}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4 mt-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="baseUnitId"
                    className="block text-xs font-semibold text-muted-foreground uppercase"
                  >
                    Base Unit (Parent)
                  </label>
                  <select
                    {...register('baseUnitId')}
                    id="baseUnitId"
                    className="w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">None (Is Base Unit itself)</option>
                    {baseUnitOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.shortName})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground">
                    Select a base unit if this is a derived unit (e.g. Box of Pieces).
                  </p>
                  {errors.baseUnitId && (
                    <p className="text-xs text-destructive mt-1">{errors.baseUnitId.message}</p>
                  )}
                </div>

                {baseUnitId && (
                  <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                    <Input
                      {...register('conversionRatio')}
                      id="conversionRatio"
                      type="number"
                      step="0.0001"
                      label="Conversion Ratio"
                      placeholder="12, 1000, 0.5..."
                      required
                      error={errors.conversionRatio?.message}
                    />

                    {shortNameValue && selectedBaseUnit && (
                      <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 flex gap-2 items-start text-xs text-primary">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Calculated Relation:</p>
                          <p className="mt-0.5">
                            1 {shortNameValue} ={' '}
                            <span className="font-bold font-mono">
                              {conversionRatioValue || '—'}
                            </span>{' '}
                            {selectedBaseUnit.shortName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Textarea
                {...register('description')}
                id="description"
                label="Description"
                placeholder="Describe unit usages or packing specs..."
                rows={4}
                error={errors.description?.message}
              />
            </div>
          </div>
        </div>

        {/* Right column (Settings) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-base text-foreground">Unit Settings</h3>

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
          </div>

          <Button
            type="submit"
            variant="default"
            loading={isPending}
            leftIcon={<Save className="w-4 h-4" />}
            className="w-full"
          >
            Save Unit
          </Button>
        </div>
      </div>
    </form>
  );
}

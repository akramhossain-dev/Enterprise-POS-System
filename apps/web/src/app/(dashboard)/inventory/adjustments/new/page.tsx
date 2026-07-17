'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { ArrowLeft, Check, Layers, Loader2, AlertCircle } from 'lucide-react';
import { useCreateAdjustment } from '@/hooks/use-operations';
import { WarehouseSelector } from '@/components/operations/warehouse-selector';
import { ProductSelector } from '@/components/operations/product-selector';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const REASONS = [
  'Damaged',
  'Expired',
  'Lost',
  'Found',
  'Manual Correction',
  'Initial Stock',
  'Audit Adjustment',
  'Other',
];

const schema = z.object({
  warehouseId: z.string().min(1, 'Please select a warehouse'),
  productId: z.string().min(1, 'Please select a product'),
  type: z.enum(['INCREASE', 'DECREASE', 'DAMAGE', 'EXPIRED', 'LOST']),
  quantity: z.coerce.number().min(0.01, 'Quantity must be at least 0.01'),
  reason: z.string().min(1, 'Please select or type a reason'),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateAdjustmentPage() {
  const mutation = useCreateAdjustment();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    resetField,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'INCREASE',
      reason: 'Manual Correction',
    },
  });

  const selectedWarehouseId = watch('warehouseId');
  const selectedProductId = watch('productId');
  const selectedType = watch('type');

  const [selectedProductDetails, setSelectedProductDetails] = React.useState<{
    name: string;
    sku?: string | null;
    availableQuantity?: number;
  } | null>(null);

  // If warehouse changes, reset the selected product to avoid mismatch
  React.useEffect(() => {
    resetField('productId');
    setSelectedProductDetails(null);
  }, [selectedWarehouseId, resetField]);

  // Handle selected type changes to update reason defaults
  React.useEffect(() => {
    if (selectedType === 'DAMAGE') setValue('reason', 'Damaged');
    else if (selectedType === 'EXPIRED') setValue('reason', 'Expired');
    else if (selectedType === 'LOST') setValue('reason', 'Lost');
    else if (selectedType === 'INCREASE') setValue('reason', 'Found');
    else setValue('reason', 'Manual Correction');
  }, [selectedType, setValue]);

  const onSubmit = async (values: FormValues) => {
    // If decreasing and quantity > available, show confirmation or error
    if (
      ['DECREASE', 'DAMAGE', 'EXPIRED', 'LOST'].includes(values.type) &&
      selectedProductDetails?.availableQuantity !== undefined &&
      values.quantity > selectedProductDetails.availableQuantity
    ) {
      if (
        !window.confirm(
          `Adjustment quantity (${values.quantity}) exceeds available stock (${selectedProductDetails.availableQuantity}). Do you wish to continue? This may result in negative inventory.`,
        )
      ) {
        return;
      }
    }

    try {
      await mutation.mutateAsync({
        companyId: '11111111-1111-1111-1111-111111111111',
        warehouseId: values.warehouseId,
        productId: values.productId,
        type: values.type,
        quantity: values.quantity,
        reason: values.reason,
        remarks: values.remarks,
      });
    } catch {}
  };

  const handleSelectProduct = (prod: any) => {
    setValue('productId', prod.id);
    setSelectedProductDetails(prod);
  };

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/inventory/adjustments">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to List
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Record Stock Adjustment"
        description="Manually balance warehouse stock levels, register lost assets, or declare damaged and expired batches."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left main form card */}
        <Card className="md:col-span-2 shadow-sm border-border bg-card">
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Adjustment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-sm">
              {/* Warehouse selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Target Warehouse Depot
                </label>
                <Controller
                  name="warehouseId"
                  control={control}
                  render={({ field }) => (
                    <WarehouseSelector
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.warehouseId?.message}
                      placeholder="Select warehouse where stock is changing..."
                    />
                  )}
                />
              </div>

              {/* Product selector - enabled only when warehouse is selected */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Product Catalog Item
                </label>
                {selectedWarehouseId ? (
                  <div>
                    <ProductSelector
                      warehouseId={selectedWarehouseId}
                      onSelect={handleSelectProduct}
                      excludeIds={selectedProductId ? [selectedProductId] : []}
                      placeholder="Search items in this warehouse..."
                    />
                    {errors.productId && (
                      <p className="text-xs font-medium text-rose-500 mt-1">
                        {errors.productId.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted/30 border border-dashed rounded-lg p-3 text-center text-xs text-muted-foreground">
                    Please select a warehouse depot first to search items.
                  </div>
                )}
              </div>

              {/* Select type and quantity */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Adjustment Direction
                  </label>
                  <select
                    {...register('type')}
                    className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none"
                  >
                    <option value="INCREASE">INCREASE Stock (+)</option>
                    <option value="DECREASE">DECREASE Stock (-)</option>
                    <option value="DAMAGE">DAMAGE Block (-)</option>
                    <option value="EXPIRED">EXPIRED Batch (-)</option>
                    <option value="LOST">LOST Stock (-)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Adjustment Quantity
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('quantity')}
                    placeholder="0.00"
                    className="bg-muted/10 border-border"
                  />
                  {errors.quantity && (
                    <p className="text-xs font-medium text-rose-500">{errors.quantity.message}</p>
                  )}
                </div>
              </div>

              {/* Reason list */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Reconciliation Reason
                </label>
                <select
                  {...register('reason')}
                  className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {errors.reason && (
                  <p className="text-xs font-medium text-rose-500">{errors.reason.message}</p>
                )}
              </div>

              {/* Remarks notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Internal Remarks & Audit Details
                </label>
                <Textarea
                  {...register('remarks')}
                  placeholder="Record why this adjustment is made (e.g. Audit variance, broken cargo carton...)"
                  rows={4}
                  className="bg-muted/10 border-border"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <Link href="/inventory/adjustments">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Apply Adjustment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right side summary/context panel */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Active Product Context</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-4">
              {selectedProductDetails ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground block uppercase text-[10px]">
                      Product Name
                    </span>
                    <span className="font-semibold text-foreground text-sm">
                      {selectedProductDetails.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block uppercase text-[10px]">
                      SKU Identifier
                    </span>
                    <span className="font-mono text-foreground font-semibold bg-muted px-1 py-0.5 rounded">
                      {selectedProductDetails.sku || 'N/A'}
                    </span>
                  </div>
                  {selectedProductDetails.availableQuantity !== undefined && (
                    <div className="border-t pt-3">
                      <span className="text-muted-foreground block uppercase text-[10px]">
                        Current Available Stock
                      </span>
                      <span className="text-base font-bold text-foreground">
                        {selectedProductDetails.availableQuantity.toFixed(2)} units
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No product selected yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Attachments UI Foundation Placeholder */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Evidence Attachments (UI Foundation)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <div className="border border-dashed rounded-lg p-6 text-center bg-muted/20 border-border/60 hover:bg-muted/40 cursor-pointer transition-colors duration-200">
                <AlertCircle className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
                <p className="font-semibold text-muted-foreground">Drag & drop files or click</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                  Upload photos of damaged or lost items
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

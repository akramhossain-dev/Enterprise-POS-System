'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Barcode as BarcodeIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageManager, type ImageFile } from './image-manager';
import { BarcodeWidget } from './barcode-widget';
import { useCategories, useBrands, useUnits, useTaxes } from '@/hooks/use-product';
import type { Product } from '@/types/product';
import { useEffect, useState } from 'react';

const productSchema = z
  .object({
    name: z.string().min(1, 'Product name is required').max(255),
    sku: z.string().max(100).optional(),
    barcode: z.string().max(100).optional(),
    description: z.string().max(5000).optional(),
    purchasePrice: z.coerce
      .number({ invalid_type_error: 'Purchase price must be a number' })
      .min(0, 'Purchase price must be >= 0'),
    sellingPrice: z.coerce
      .number({ invalid_type_error: 'Selling price must be a number' })
      .min(0, 'Selling price must be >= 0'),
    categoryId: z.string().uuid().optional().or(z.literal('')),
    brandId: z.string().uuid().optional().or(z.literal('')),
    unitId: z.string().uuid({ message: 'Unit is required' }),
    taxId: z.string().uuid().optional().or(z.literal('')),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    images: z.array(
      z.object({
        id: z.string(),
        url: z.string(),
        name: z.string(),
        progress: z.number(),
        isPrimary: z.boolean(),
        file: z.any().optional(),
      }),
    ),
  })
  .refine((data) => data.sellingPrice >= data.purchasePrice, {
    message: 'Selling price must be greater than or equal to purchase price',
    path: ['sellingPrice'],
  });

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialValues?: Product;
  onSubmit: (values: ProductFormValues) => void;
  isPending: boolean;
}

export function ProductForm({ initialValues, onSubmit, isPending }: ProductFormProps) {
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const { data: units = [] } = useUnits();
  const { data: taxes = [] } = useTaxes();

  const formattedImages: ImageFile[] =
    initialValues?.images?.map((img) => ({
      id: img.id,
      url: img.url,
      name: img.altText || 'Product Image',
      progress: 100,
      isPrimary: img.isPrimary,
    })) ||
    (initialValues?.image
      ? [
          {
            id: 'primary',
            url: initialValues.image,
            name: 'Primary Image',
            progress: 100,
            isPrimary: true,
          },
        ]
      : []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialValues?.name ?? '',
      sku: initialValues?.sku ?? '',
      barcode: initialValues?.barcode ?? '',
      description: initialValues?.description ?? '',
      purchasePrice: initialValues?.purchasePrice ?? 0,
      sellingPrice: initialValues?.sellingPrice ?? 0,
      categoryId: initialValues?.categoryId ?? '',
      brandId: initialValues?.brandId ?? '',
      unitId: initialValues?.unitId ?? '',
      taxId: initialValues?.taxId ?? '',
      status:
        initialValues?.status === 'ACTIVE' || initialValues?.status === 'INACTIVE'
          ? initialValues?.status
          : 'ACTIVE',
      images: formattedImages,
    },
    mode: 'onBlur',
  });

  const barcodeValue = watch('barcode');
  const productName = watch('name');
  const sellingPrice = watch('sellingPrice');

  const generateBarcode = () => {
    // Generate simple standard barcode: e.g. company initials + random 8-digits
    const random = Math.floor(10000000 + Math.random() * 90000000).toString();
    setValue('barcode', `EP${random}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main content columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="rounded-xl border border-border bg-cardard p-5 space-y-4">
            <h3 className="font-semibold text-base text-foreground">General Information</h3>
            <div className="space-y-4">
              <Input
                {...register('name')}
                id="name"
                label="Product Name"
                placeholder="iPhone 15 Pro, Organic Milk..."
                required
                error={errors.name?.message}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  {...register('sku')}
                  id="sku"
                  label="SKU"
                  placeholder="PROD-1004"
                  error={errors.sku?.message}
                />
                <div className="space-y-1">
                  <Input
                    {...register('barcode')}
                    id="barcode"
                    label="Barcode / UPC"
                    placeholder="880901234567"
                    error={errors.barcode?.message}
                    rightElement={
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={generateBarcode}
                        leftIcon={<BarcodeIcon className="w-3.5 h-3.5" />}
                        className="h-7 text-[10px]"
                      >
                        Auto
                      </Button>
                    }
                  />
                </div>
              </div>

              <Textarea
                {...register('description')}
                id="description"
                label="Description"
                placeholder="Product technical details, features..."
                rows={4}
                error={errors.description?.message}
              />
            </div>
          </div>

          {/* Pricing & Financials */}
          <div className="rounded-xl border border-border bg-cardard p-5 space-y-4">
            <h3 className="font-semibold text-base text-foreground">Pricing & Financials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                {...register('purchasePrice')}
                id="purchasePrice"
                type="number"
                step="0.01"
                label="Purchase Price ($)"
                placeholder="0.00"
                required
                error={errors.purchasePrice?.message}
              />
              <Input
                {...register('sellingPrice')}
                id="sellingPrice"
                type="number"
                step="0.01"
                label="Selling Price ($)"
                placeholder="0.00"
                required
                error={errors.sellingPrice?.message}
              />
            </div>
          </div>

          {/* Image Upload Manager */}
          <div className="rounded-xl border border-border bg-cardard p-5 space-y-4">
            <h3 className="font-semibold text-base text-foreground">Images & Gallery</h3>
            <Controller
              name="images"
              control={control}
              render={({ field }) => <ImageManager value={field.value} onChange={field.onChange} />}
            />
          </div>
        </div>

        {/* Right Sidebar columns */}
        <div className="space-y-6">
          {/* Classification & Status */}
          <div className="rounded-xl border border-border bg-cardard p-5 space-y-4">
            <h3 className="font-semibold text-base text-foreground">Catalog & Organization</h3>

            <div className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label
                  htmlFor="categoryId"
                  className="block text-xs font-semibold text-muted-foreground uppercase"
                >
                  Category
                </label>
                <select
                  {...register('categoryId')}
                  id="categoryId"
                  className="w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="space-y-1.5">
                <label
                  htmlFor="brandId"
                  className="block text-xs font-semibold text-muted-foreground uppercase"
                >
                  Brand
                </label>
                <select
                  {...register('brandId')}
                  id="brandId"
                  className="w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit */}
              <div className="space-y-1.5">
                <label
                  htmlFor="unitId"
                  className="block text-xs font-semibold text-muted-foreground uppercase"
                >
                  Unit *
                </label>
                <select
                  {...register('unitId')}
                  id="unitId"
                  required
                  className="w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select Unit</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.shortName})
                    </option>
                  ))}
                </select>
                {errors.unitId && (
                  <p className="text-xs text-destructive mt-1">{errors.unitId.message}</p>
                )}
              </div>

              {/* Tax */}
              <div className="space-y-1.5">
                <label
                  htmlFor="taxId"
                  className="block text-xs font-semibold text-muted-foreground uppercase"
                >
                  Tax Rate
                </label>
                <select
                  {...register('taxId')}
                  id="taxId"
                  className="w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select Tax</option>
                  {taxes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.percentage}%)
                    </option>
                  ))}
                </select>
              </div>

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
              </div>
            </div>
          </div>

          {/* Barcode Preview widget */}
          {barcodeValue && (
            <BarcodeWidget barcode={barcodeValue} name={productName} price={sellingPrice} />
          )}

          {/* Submit Actions */}
          <div className="rounded-xl border border-border bg-cardard p-5 flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              loading={isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {initialValues ? 'Save Product' : 'Create Product'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

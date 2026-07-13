'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Lock, Unlock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCategoriesList } from '@/hooks/use-catalog';
import type { Category } from '@/types/product';
import { useEffect, useState, useRef } from 'react';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  parentId: z.string().uuid().optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  image: z.string().optional().or(z.literal('')),
  icon: z.string().max(100).optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0, 'Order must be >= 0'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  seoTitle: z.string().max(255).optional().or(z.literal('')),
  seoDescription: z.string().max(2000).optional().or(z.literal('')),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialValues?: Category;
  onSubmit: (values: CategoryFormValues) => void;
  isPending: boolean;
}

export function CategoryForm({ initialValues, onSubmit, isPending }: CategoryFormProps) {
  const { data: categoriesData } = useCategoriesList({ limit: 1000 });
  const categories = categoriesData?.data ?? [];

  const [isSlugLocked, setIsSlugLocked] = useState(true);
  const [showSeo, setShowSeo] = useState(false);
  const nameTouched = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
      parentId: initialValues?.parentId ?? '',
      description: initialValues?.description ?? '',
      image: initialValues?.image ?? '',
      icon: initialValues?.icon ?? '',
      displayOrder: initialValues?.displayOrder ?? 0,
      status: initialValues?.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      seoTitle: initialValues?.seoTitle ?? '',
      seoDescription: initialValues?.seoDescription ?? '',
    },
    mode: 'onBlur',
  });

  const nameValue = watch('name');

  useEffect(() => {
    if (nameValue && isSlugLocked && !initialValues) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug);
    }
  }, [nameValue, isSlugLocked, setValue, initialValues]);

  // Filter out self as potential parent for edit mode
  const filteredCategories = categories.filter((c) => c.id !== initialValues?.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-base text-foreground">Category Details</h3>

            <div className="space-y-4">
              <Input
                {...register('name')}
                id="name"
                label="Category Name"
                placeholder="Electronics, Groceries, Men's Fashion..."
                required
                error={errors.name?.message}
                onChange={() => {
                  nameTouched.current = true;
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 relative">
                  <Input
                    {...register('slug')}
                    id="slug"
                    label="Slug (URL Path)"
                    placeholder="electronics-devices"
                    required
                    error={errors.slug?.message}
                    disabled={isSlugLocked}
                    rightElement={
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => setIsSlugLocked(!isSlugLocked)}
                        leftIcon={
                          isSlugLocked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )
                        }
                        className="h-7 text-[10px]"
                      >
                        {isSlugLocked ? 'Unlock' : 'Lock'}
                      </Button>
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="parentId"
                    className="block text-xs font-semibold text-muted-foreground uppercase"
                  >
                    Parent Category
                  </label>
                  <select
                    {...register('parentId')}
                    id="parentId"
                    className="w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">None (Root Category)</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.parentId && (
                    <p className="text-xs text-destructive mt-1">{errors.parentId.message}</p>
                  )}
                </div>
              </div>

              <Textarea
                {...register('description')}
                id="description"
                label="Description"
                placeholder="Provide a brief summary of what products belong in this category..."
                rows={4}
                error={errors.description?.message}
              />
            </div>
          </div>

          {/* SEO (Search Engine Optimization) Collapsible */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-base text-foreground">
                  SEO Options (Optional)
                </span>
              </div>
              {showSeo ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {showSeo && (
              <div className="px-5 pb-5 pt-2 border-t border-border space-y-4 bg-muted/5 animate-[fadeIn_0.2s_ease-out]">
                <Input
                  {...register('seoTitle')}
                  id="seoTitle"
                  label="SEO Title"
                  placeholder="Buy Electronics Online | My POS Store"
                  error={errors.seoTitle?.message}
                />
                <Textarea
                  {...register('seoDescription')}
                  id="seoDescription"
                  label="SEO Meta Description"
                  placeholder="Browse our collection of high quality electronic gadgets and home accessories at the best prices."
                  rows={3}
                  error={errors.seoDescription?.message}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar settings (Right col) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-base text-foreground">Status & Settings</h3>

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

              {/* Display Order */}
              <Input
                {...register('displayOrder')}
                id="displayOrder"
                type="number"
                label="Display Order (Priority)"
                placeholder="0"
                error={errors.displayOrder?.message}
              />

              {/* Image Input */}
              <Input
                {...register('image')}
                id="image"
                label="Category Image URL"
                placeholder="https://example.com/image.png"
                error={errors.image?.message}
              />

              {/* Icon Input */}
              <Input
                {...register('icon')}
                id="icon"
                label="Category Icon (Lucide class/name)"
                placeholder="Laptop, Smartphone, Apple..."
                error={errors.icon?.message}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="default"
              loading={isPending}
              leftIcon={<Save className="w-4 h-4" />}
              className="flex-1"
            >
              Save Category
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

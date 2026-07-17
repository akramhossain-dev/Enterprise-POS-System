'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Loader2,
  Warehouse as WarehouseIcon,
  Package,
} from 'lucide-react';
import { useCreateTransfer } from '@/hooks/use-operations';
import { WarehouseSelector } from '@/components/operations/warehouse-selector';
import { ProductSelector } from '@/components/operations/product-selector';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const schema = z.object({
  fromWarehouseId: z.string().min(1, 'Please select a source warehouse'),
  toWarehouseId: z.string().min(1, 'Please select a destination warehouse'),
  remarks: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        sku: z.string(),
        availableQuantity: z.number(),
        quantity: z.coerce.number().min(0.01, 'Quantity must be at least 0.01'),
      }),
    )
    .min(1, 'Please add at least one product item to transfer'),
});

type FormValues = z.infer<typeof schema>;

export default function CreateTransferPage() {
  const mutation = useCreateTransfer();

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
      items: [],
    },
  });

  const fromWarehouseId = watch('fromWarehouseId');
  const toWarehouseId = watch('toWarehouseId');
  const items = watch('items') || [];

  // Reset items if source warehouse changes to prevent incorrect stock checks
  React.useEffect(() => {
    setValue('items', []);
  }, [fromWarehouseId, setValue]);

  const handleSelectProduct = (prod: any) => {
    const exists = items.some((item) => item.productId === prod.id);
    if (exists) {
      toast.warning('Product already added to transfer items list.');
      return;
    }

    const available = prod.availableQuantity ?? 0;
    if (available <= 0) {
      toast.warning(
        'Cannot transfer product: zero or negative stock available at source warehouse.',
      );
      return;
    }

    const newItems = [
      ...items,
      {
        productId: prod.id,
        name: prod.name,
        sku: prod.sku || '',
        availableQuantity: available,
        quantity: 1, // Default quantity
      },
    ];
    setValue('items', newItems);
  };

  const handleRemoveItem = (index: number) => {
    setValue(
      'items',
      items.filter((_, i) => i !== index),
    );
  };

  const handleUpdateQty = (index: number, val: number) => {
    const target = items[index];
    if (!target) return;
    if (val > target.availableQuantity) {
      toast.warning(
        `Quantity (${val}) exceeds available source depot quantity (${target.availableQuantity}). Correcting...`,
      );
      val = target.availableQuantity;
    }
    const updated = [...items];
    const targetUpdate = updated[index];
    if (!targetUpdate) return;
    targetUpdate.quantity = val;
    setValue('items', updated);
  };

  const onSubmit = async (values: FormValues) => {
    if (values.fromWarehouseId === values.toWarehouseId) {
      toast.error('Source and Destination warehouse locations must be different.');
      return;
    }

    try {
      await mutation.mutateAsync({
        companyId: '11111111-1111-1111-1111-111111111111',
        fromWarehouseId: values.fromWarehouseId,
        toWarehouseId: values.toWarehouseId,
        remarks: values.remarks,
        items: values.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });
    } catch {}
  };

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/inventory/transfers">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to List
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Initiate Stock Transfer"
        description="Transfer products between warehouses. Transfer starts in PENDING approval and must be approved and completed to move stock."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-sm">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main selection card */}
          <Card className="md:col-span-2 shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Transfer Line Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Product search box - only active when fromWarehouse is selected */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Add Product Item to Transfer
                </label>
                {fromWarehouseId ? (
                  <ProductSelector
                    warehouseId={fromWarehouseId}
                    onSelect={handleSelectProduct}
                    placeholder="Search source inventory catalog by name or SKU..."
                  />
                ) : (
                  <div className="bg-muted/30 border border-dashed rounded-lg p-3 text-center text-xs text-muted-foreground">
                    Please select a source warehouse depot first to load available inventory.
                  </div>
                )}
              </div>

              {/* Added items list */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border font-semibold text-muted-foreground">
                      <th className="p-3">Product Info</th>
                      <th className="p-3 text-right">Available Qty</th>
                      <th className="p-3 text-center w-32">Transfer Qty</th>
                      <th className="p-3 text-center w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-muted-foreground italic">
                          No items added yet. Search and select products above to add them.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr
                          key={item.productId}
                          className="border-b last:border-b-0 border-border bg-card hover:bg-muted/20"
                        >
                          <td className="p-3">
                            <div className="flex flex-col font-medium">
                              <span className="font-semibold text-foreground text-sm">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                SKU: {item.sku}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono font-semibold text-foreground">
                            {item.availableQuantity.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={item.availableQuantity}
                              value={item.quantity}
                              onChange={(e) => handleUpdateQty(index, Number(e.target.value))}
                              className="h-8 text-center bg-muted/10 font-bold"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {errors.items && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.items.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Right sidebar options */}
          <div className="space-y-6">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <WarehouseIcon className="w-4 h-4 text-primary" /> Route Depots
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Source warehouse */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Source Warehouse Depot
                  </label>
                  <Controller
                    name="fromWarehouseId"
                    control={control}
                    render={({ field }) => (
                      <WarehouseSelector
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.fromWarehouseId?.message}
                        placeholder="Select source..."
                      />
                    )}
                  />
                </div>

                {/* Destination warehouse */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Destination Warehouse Depot
                  </label>
                  <Controller
                    name="toWarehouseId"
                    control={control}
                    render={({ field }) => (
                      <WarehouseSelector
                        value={field.value}
                        onChange={field.onChange}
                        excludeId={fromWarehouseId}
                        error={errors.toWarehouseId?.message}
                        placeholder="Select destination..."
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold">Transfer Comments</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Remarks & Transit Notes
                  </label>
                  <Textarea
                    {...register('remarks')}
                    placeholder="Enter dispatch notes, truck number, driver info, expected arrival..."
                    rows={4}
                    className="bg-muted/10 border-border"
                  />
                </div>

                <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Register Transfer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}

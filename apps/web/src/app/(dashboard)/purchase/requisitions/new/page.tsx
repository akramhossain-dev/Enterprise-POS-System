'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Loader2, Package, Layers } from 'lucide-react';
import { useCreatePurchaseRequisition } from '@/hooks/use-purchase';
import { WarehouseSelector } from '@/components/operations/warehouse-selector';
import { SupplierSelector } from '@/components/purchase/supplier-selector';
import { ProductSelector } from '@/components/purchase/product-selector';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(1, 'Please enter a title/subject'),
  requestedBy: z.string().min(1, 'Please enter the requester name'),
  department: z.string().min(1, 'Please enter the department'),
  requiredDate: z.string().min(1, 'Please select a required date'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  supplierId: z.string().min(1, 'Please select a supplier vendor'),
  supplierName: z.string(),
  warehouseId: z.string().min(1, 'Please select a destination warehouse'),
  warehouseName: z.string(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        productName: z.string(),
        sku: z.string(),
        quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
        unitPrice: z.coerce.number().min(0.01, 'Unit cost must be at least 0.01'),
        subtotal: z.number(),
      }),
    )
    .min(1, 'Please add at least one product item to requisition list'),
});

type FormValues = z.infer<typeof schema>;

export default function CreateRequisitionPage() {
  const mutation = useCreatePurchaseRequisition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 'MEDIUM',
      items: [],
      title: `Stock Requisition — ${new Date().toLocaleDateString()}`,
      requestedBy: 'Procurement Specialist',
      department: 'Logistics',
      requiredDate:
        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    },
  });

  const items = watch('items') || [];
  const subtotalSum = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [items]);

  const handleSelectProduct = (prod: any) => {
    const exists = items.some((item) => item.productId === prod.id);
    if (exists) {
      toast.warning('Product already added to requisition items list.');
      return;
    }

    const newItems = [
      ...items,
      {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku || '',
        quantity: 1,
        unitPrice: prod.unitPrice,
        subtotal: prod.unitPrice,
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
    const updated = [...items];
    const target = updated[index];
    if (!target) return;
    target.quantity = val;
    target.subtotal = val * target.unitPrice;
    setValue('items', updated);
  };

  const handleUpdatePrice = (index: number, val: number) => {
    const updated = [...items];
    const target = updated[index];
    if (!target) return;
    target.unitPrice = val;
    target.subtotal = target.quantity * val;
    setValue('items', updated);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync({
        title: values.title,
        requestedBy: values.requestedBy,
        department: values.department,
        requiredDate: values.requiredDate,
        priority: values.priority,
        supplierId: values.supplierId,
        supplierName: values.supplierName,
        warehouseId: values.warehouseId,
        warehouseName: values.warehouseName,
        notes: values.notes || null,
        subtotal: subtotalSum,
        items: values.items.map((i) => ({
          id: i.productId,
          productId: i.productId,
          productName: i.productName,
          sku: i.sku,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.subtotal,
        })),
      });
    } catch {}
  };

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/purchase/requisitions">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Requisitions
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Create Purchase Requisition"
        description="Raise a department purchase requisition for active store assets and inventory products."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-sm">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main items grid */}
          <Card className="md:col-span-2 shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Requisition Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Product search box */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Add Catalog Product
                </label>
                <ProductSelector
                  onSelect={handleSelectProduct}
                  placeholder="Search catalog items by SKU, name, or barcodes..."
                />
              </div>

              {/* Items grid */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border font-semibold text-muted-foreground">
                      <th className="p-3 pl-6">Product Details</th>
                      <th className="p-3 text-center w-28">Quantity</th>
                      <th className="p-3 text-right w-28">Est. Unit Cost</th>
                      <th className="p-3 text-right w-28 pr-6">Estimated Cost</th>
                      <th className="p-3 text-center w-16">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground italic">
                          No products added to this request. Search above to insert items.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr
                          key={item.productId}
                          className="border-b last:border-b-0 border-border bg-cardard hover:bg-muted/10"
                        >
                          <td className="p-3 pl-6">
                            <div className="flex flex-col font-medium">
                              <span className="font-semibold text-foreground text-sm">
                                {item.productName}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                SKU: {item.sku}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQty(index, Number(e.target.value))}
                              className="h-8 text-center bg-muted/10 font-semibold"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdatePrice(index, Number(e.target.value))}
                              className="h-8 text-right bg-muted/10 font-semibold font-mono"
                            />
                          </td>
                          <td className="p-3 text-right pr-6 font-mono font-bold text-foreground">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
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

          {/* Right sidebar config */}
          <div className="space-y-6">
            <Card className="shadow-sm border-border bg-cardard">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" /> Request Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Requisition Title
                  </label>
                  <Input
                    {...register('title')}
                    className="bg-muted/10 border-border font-semibold"
                  />
                  {errors.title && <p className="text-xs text-rose-500">{errors.title.message}</p>}
                </div>

                {/* Requester */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Requested By
                  </label>
                  <Input {...register('requestedBy')} className="bg-muted/10 border-border" />
                  {errors.requestedBy && (
                    <p className="text-xs text-rose-500">{errors.requestedBy.message}</p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Department Unit
                  </label>
                  <Input {...register('department')} className="bg-muted/10 border-border" />
                  {errors.department && (
                    <p className="text-xs text-rose-500">{errors.department.message}</p>
                  )}
                </div>

                {/* Required date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Required Delivery Date
                  </label>
                  <Input
                    type="date"
                    {...register('requiredDate')}
                    className="bg-muted/10 border-border"
                  />
                  {errors.requiredDate && (
                    <p className="text-xs text-rose-500">{errors.requiredDate.message}</p>
                  )}
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Priority Level
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
                  >
                    <option value="LOW">LOW Priority</option>
                    <option value="MEDIUM">MEDIUM Priority</option>
                    <option value="HIGH">HIGH Priority</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-cardard">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold">Vendor & Warehouse Route</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Supplier */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Target Supplier Partner
                  </label>
                  <Controller
                    name="supplierId"
                    control={control}
                    render={({ field }) => (
                      <SupplierSelector
                        value={field.value}
                        onChange={(id, name) => {
                          field.onChange(id);
                          setValue('supplierName', name);
                        }}
                        error={errors.supplierId?.message}
                      />
                    )}
                  />
                </div>

                {/* Warehouse */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Destination Warehouse
                  </label>
                  <Controller
                    name="warehouseId"
                    control={control}
                    render={({ field }) => (
                      <WarehouseSelector
                        value={field.value}
                        onChange={(id) => {
                          field.onChange(id);
                          // Lookup name manually
                          setValue('warehouseName', 'Selected Depot');
                        }}
                        error={errors.warehouseId?.message}
                      />
                    )}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Requisition Notes
                  </label>
                  <Textarea
                    {...register('notes')}
                    placeholder="Enter justification notes, quantity details..."
                    rows={3}
                    className="bg-muted/10 border-border"
                  />
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-dashed pt-4 flex justify-between items-center text-sm font-bold">
                  <span className="uppercase text-muted-foreground text-xs">Estimated Cost:</span>
                  <span className="text-primary text-base font-mono">
                    ${subtotalSum.toFixed(2)}
                  </span>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Requisition Draft
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}

'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Loader2,
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { usePurchaseOrderDetails, useUpdatePurchaseOrder } from '@/hooks/use-purchase';
import { WarehouseSelector } from '@/components/operations/warehouse-selector';
import { SupplierSelector } from '@/components/purchase/supplier-selector';
import { ProductSelector } from '@/components/purchase/product-selector';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBranches } from '@/hooks/use-branch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const schema = z.object({
  supplierId: z.string().min(1, 'Please select a supplier vendor'),
  warehouseId: z.string().min(1, 'Please select a warehouse'),
  branchId: z.string().nullable().optional(),
  purchaseOrderNumber: z.string().min(1, 'Please enter a PO number'),
  referenceNumber: z.string().optional(),
  orderDate: z.string().min(1, 'Order date required'),
  expectedDate: z.string().nullable().optional(),
  remarks: z.string().optional(),
  shippingCost: z.coerce.number().min(0, 'Shipping cost must be non-negative'),
  globalDiscount: z.coerce.number().min(0, 'Discount must be non-negative'),
  globalTax: z.coerce.number().min(0, 'Tax must be non-negative'),
  items: z
    .array(
      z.object({
        productId: z.string(),
        productName: z.string(),
        sku: z.string(),
        quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
        unitPrice: z.coerce.number().min(0.01, 'Price must be at least 0.01'),
        discount: z.coerce.number().min(0, 'Discount must be non-negative'),
        tax: z.coerce.number().min(0, 'Tax must be non-negative'),
        subtotal: z.number(),
      }),
    )
    .min(1, 'Please add at least one product item to purchase order'),
});

type FormValues = z.infer<typeof schema>;

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params['id'] as string;

  const { data: po, isLoading, error } = usePurchaseOrderDetails(id);
  const mutation = useUpdatePurchaseOrder();

  const { data: branchResponse } = useBranches();
  const branches = branchResponse?.data || [];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const items = watch('items') || [];
  const shippingCost = watch('shippingCost') || 0;
  const globalDiscount = watch('globalDiscount') || 0;
  const globalTax = watch('globalTax') || 0;

  // Pre-fill form fields
  React.useEffect(() => {
    if (po) {
      reset({
        supplierId: po.supplierId,
        warehouseId: po.warehouseId,
        branchId: po.branchId || null,
        purchaseOrderNumber: po.purchaseOrderNumber,
        referenceNumber: po.remarks || '', // Fallback or mapping
        orderDate: new Date(po.orderDate).toISOString().split('T')[0] || '',
        expectedDate: po.expectedDate
          ? new Date(po.expectedDate).toISOString().split('T')[0]
          : null,
        remarks: po.remarks || '',
        shippingCost: Number(po.shippingCost),
        globalDiscount: Number(po.discount),
        globalTax: Number(po.tax),
        items: po.items.map((i) => ({
          productId: i.productId,
          productName: i.product?.name || '—',
          sku: i.product?.sku || '',
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          discount: Number(i.discount),
          tax: Number(i.tax),
          subtotal: Number(i.total),
        })),
      });
    }
  }, [po, reset]);

  // Compute pricing totals
  const subtotalSum = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [items]);

  const itemsDiscountSum = React.useMemo(() => {
    return items.reduce((sum, item) => sum + (item.discount || 0), 0);
  }, [items]);

  const itemsTaxSum = React.useMemo(() => {
    return items.reduce((sum, item) => sum + (item.tax || 0), 0);
  }, [items]);

  const totalDiscount = itemsDiscountSum + globalDiscount;
  const totalTax = itemsTaxSum + globalTax;
  const grandTotal = subtotalSum - totalDiscount + totalTax + shippingCost;

  const handleSelectProduct = (prod: any) => {
    const exists = items.some((item) => item.productId === prod.id);
    if (exists) {
      toast.warning('Product already added to purchase order items list.');
      return;
    }

    const computedTax = Number(((prod.unitPrice * prod.taxRate) / 100).toFixed(2));

    const newItems = [
      ...items,
      {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku || '',
        quantity: 1,
        unitPrice: prod.unitPrice,
        discount: 0,
        tax: computedTax,
        subtotal: prod.unitPrice + computedTax,
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
    target.subtotal = val * target.unitPrice - target.discount + target.tax;
    setValue('items', updated);
  };

  const handleUpdatePrice = (index: number, val: number) => {
    const updated = [...items];
    const target = updated[index];
    if (!target) return;
    target.unitPrice = val;
    target.subtotal = target.quantity * val - target.discount + target.tax;
    setValue('items', updated);
  };

  const handleUpdateDiscount = (index: number, val: number) => {
    const updated = [...items];
    const target = updated[index];
    if (!target) return;
    target.discount = val;
    target.subtotal = target.quantity * target.unitPrice - val + target.tax;
    setValue('items', updated);
  };

  const handleUpdateTax = (index: number, val: number) => {
    const updated = [...items];
    const target = updated[index];
    if (!target) return;
    target.tax = val;
    target.subtotal = target.quantity * target.unitPrice - target.discount + val;
    setValue('items', updated);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync({
        id,
        payload: {
          branchId: values.branchId || null,
          warehouseId: values.warehouseId,
          supplierId: values.supplierId,
          expectedDate: values.expectedDate || null,
          remarks: values.remarks || null,
          items: values.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discount: i.discount,
            tax: i.tax,
          })),
          shippingCost,
          discount: globalDiscount,
          tax: globalTax,
        },
      });
    } catch {}
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-4">
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  if (error || !po) {
    return (
      <PageContainer>
        <div className="text-center py-16 bg-cardard border rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">Purchase Order Not Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The requested purchase order record does not exist.
          </p>
          <Link href="/purchase/orders" className="inline-block mt-4">
            <Button size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Orders
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  if (po.status !== 'DRAFT') {
    return (
      <PageContainer>
        <div className="text-center py-16 bg-cardard border rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">Edits Forbidden</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Only purchase orders in DRAFT status can be modified. This order has already been
            submitted for review.
          </p>
          <Link href={`/purchase/orders/${id}`} className="inline-block mt-4">
            <Button size="sm">View Purchase Order Details</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href={`/purchase/orders/${id}`}>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Cancel Edits
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Edit Purchase Order"
        description={`Modify parameters for order ${po.purchaseOrderNumber}`}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-sm">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main items grid */}
          <Card className="md:col-span-2 shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Purchase Order Line Items
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
                  placeholder="Search catalog items to add..."
                />
              </div>

              {/* Items grid */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border font-semibold text-muted-foreground">
                      <th className="p-3 pl-6">Product Details</th>
                      <th className="p-3 text-center w-20">Quantity</th>
                      <th className="p-3 text-right w-24">Unit Cost</th>
                      <th className="p-3 text-right w-20">Discount</th>
                      <th className="p-3 text-right w-20">Tax</th>
                      <th className="p-3 text-right w-24 pr-6">Subtotal</th>
                      <th className="p-3 text-center w-12">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-muted-foreground italic">
                          No products added to this order.
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
                              className="h-8 text-center bg-muted/10 font-semibold px-1"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdatePrice(index, Number(e.target.value))}
                              className="h-8 text-right bg-muted/10 font-semibold font-mono px-1"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.discount}
                              onChange={(e) => handleUpdateDiscount(index, Number(e.target.value))}
                              className="h-8 text-right bg-muted/10 font-semibold font-mono px-1"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.tax}
                              onChange={(e) => handleUpdateTax(index, Number(e.target.value))}
                              className="h-8 text-right bg-muted/10 font-semibold font-mono px-1"
                            />
                          </td>
                          <td className="p-3 text-right pr-6 font-mono font-bold text-foreground">
                            $
                            {(item.quantity * item.unitPrice - item.discount + item.tax).toFixed(2)}
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
            </CardContent>
          </Card>

          {/* Right sidebar config */}
          <div className="space-y-6">
            <Card className="shadow-sm border-border bg-cardard">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" /> Order Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* PO Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Purchase Order Number
                  </label>
                  <Input
                    {...register('purchaseOrderNumber')}
                    className="bg-muted/10 border-border font-semibold font-mono"
                  />
                  {errors.purchaseOrderNumber && (
                    <p className="text-xs text-rose-500">{errors.purchaseOrderNumber.message}</p>
                  )}
                </div>

                {/* Reference Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    External Reference Code
                  </label>
                  <Input {...register('referenceNumber')} className="bg-muted/10 border-border" />
                </div>

                {/* Order Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Purchase Date
                  </label>
                  <Input
                    type="date"
                    {...register('orderDate')}
                    className="bg-muted/10 border-border"
                  />
                  {errors.orderDate && (
                    <p className="text-xs text-rose-500">{errors.orderDate.message}</p>
                  )}
                </div>

                {/* Expected date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Expected Arrival Date
                  </label>
                  <Input
                    type="date"
                    {...register('expectedDate')}
                    className="bg-muted/10 border-border"
                  />
                </div>

                {/* Branch selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Purchasing Branch Outlet
                  </label>
                  <select
                    {...register('branchId')}
                    className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
                  >
                    <option value="">No branch restriction</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-cardard">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold">Logistics & Charges</CardTitle>
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
                        }}
                        error={errors.supplierId?.message}
                      />
                    )}
                  />
                </div>

                {/* Warehouse */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Target Warehouse Depot
                  </label>
                  <Controller
                    name="warehouseId"
                    control={control}
                    render={({ field }) => (
                      <WarehouseSelector
                        value={field.value}
                        onChange={(id) => {
                          field.onChange(id);
                        }}
                        error={errors.warehouseId?.message}
                      />
                    )}
                  />
                </div>

                {/* Global charges inputs */}
                <div className="grid gap-2 grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Shipping
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('shippingCost')}
                      className="h-8 bg-muted/10 font-mono text-xs text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Glob. Disc.
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('globalDiscount')}
                      className="h-8 bg-muted/10 font-mono text-xs text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Glob. Tax
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('globalTax')}
                      className="h-8 bg-muted/10 font-mono text-xs text-right"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    PO Remarks & Terms
                  </label>
                  <Textarea
                    {...register('remarks')}
                    placeholder="Enter notes..."
                    rows={3}
                    className="bg-muted/10 border-border"
                  />
                </div>

                {/* Financial Summary */}
                <div className="border-t border-dashed pt-4 space-y-2 text-xs font-semibold text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono text-foreground">${subtotalSum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="font-mono text-rose-500">-${totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-mono text-foreground">${totalTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-bold text-foreground">
                    <span>GRAND TOTAL:</span>
                    <span className="text-primary font-mono">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}

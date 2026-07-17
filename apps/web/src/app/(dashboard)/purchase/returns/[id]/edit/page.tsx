'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trash2,
  Loader2,
  Building2,
  Clipboard,
  Calendar,
  DollarSign,
  Paperclip,
} from 'lucide-react';
import { usePurchaseReturnDetails, useUpdatePurchaseReturn } from '@/hooks/use-purchase-return';
import { useSuppliers } from '@/hooks/use-supplier';
import { useWarehouses } from '@/hooks/use-warehouse';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductSelector } from '@/components/purchase/product-selector';
import { toast } from 'sonner';

const itemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  sku: z.string(),
  orderedQty: z.coerce.number().min(0),
  receivedQty: z.coerce.number().min(0),
  returnQty: z.coerce.number().min(1, 'Qty must be at least 1'),
  unitPrice: z.coerce.number().min(0.01, 'Price must be positive'),
  reason: z.string().min(1, 'Reason required'),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
});

const schema = z.object({
  supplierId: z.string().min(1, 'Select a supplier'),
  warehouseId: z.string().min(1, 'Select a warehouse'),
  referenceType: z.enum(['PO', 'GRN', 'INVOICE', 'NONE']),
  referencePoId: z.string().nullable().optional(),
  referenceGrnId: z.string().nullable().optional(),
  referenceInvoiceId: z.string().nullable().optional(),
  returnDate: z.string().min(1, 'Return date required'),
  reason: z.string().min(1, 'Select global reason'),
  returnMethod: z.enum(['CREDIT_NOTE', 'REFUND', 'REPLACEMENT']),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Add at least one return item'),
});

type FormValues = z.infer<typeof schema>;

export default function EditPurchaseReturnPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const { data: purchaseReturn, isLoading: loadingDetails } = usePurchaseReturnDetails(id);
  const updateMutation = useUpdatePurchaseReturn();

  const { data: supplierResponse } = useSuppliers({ page: 1, limit: 100 });
  const { data: warehouseResponse } = useWarehouses({ page: 1, limit: 100 });

  const suppliers = supplierResponse?.data || [];
  const warehouses = warehouseResponse?.data || [];

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const supplierId = watch('supplierId');
  const referenceType = watch('referenceType');
  const items = watch('items') || [];
  const globalReason = watch('reason') || 'DAMAGED';

  // Preload form data
  React.useEffect(() => {
    if (purchaseReturn) {
      // Direct assignment
      reset({
        supplierId: purchaseReturn.supplierId,
        warehouseId: purchaseReturn.warehouseId,
        referenceType: purchaseReturn.referenceType,
        referencePoId: purchaseReturn.referencePoId,
        referenceGrnId: purchaseReturn.referenceGrnId,
        referenceInvoiceId: purchaseReturn.referenceInvoiceId,
        returnDate: purchaseReturn.returnDate.split('T')[0],
        reason: purchaseReturn.reason,
        returnMethod: purchaseReturn.returnMethod,
        notes: purchaseReturn.notes || '',
        items: purchaseReturn.items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          orderedQty: it.orderedQty,
          receivedQty: it.receivedQty,
          returnQty: it.returnQty,
          unitPrice: it.unitPrice,
          reason: it.reason,
          status: it.status,
        })),
      });
    }
  }, [purchaseReturn, reset]);

  // Handle Manual Product Selection
  const handleSelectProduct = (prod: any) => {
    const exists = items.some((it) => it.productId === prod.id);
    if (exists) {
      toast.warning('Product item already exists in the list.');
      return;
    }
    append({
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku || '',
      orderedQty: 0,
      receivedQty: 0,
      returnQty: 1,
      unitPrice: prod.unitPrice || 10,
      reason: globalReason,
      status: 'PENDING',
    });
  };

  // Compute summaries
  const subtotal = React.useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.returnQty) * Number(item.unitPrice), 0);
  }, [items]);

  const tax = Number((subtotal * 0.1).toFixed(2));
  const discount = 0;
  const grandTotal = subtotal + tax - discount;

  // Form submission
  const onSubmit = (values: FormValues) => {
    const activeSupplier = suppliers.find((s) => s.id === values.supplierId);
    const activeWarehouse = warehouses.find((w) => w.id === values.warehouseId);

    const payload = {
      ...values,
      supplier: activeSupplier ? (activeSupplier as any) : null,
      warehouse: activeWarehouse ? (activeWarehouse as any) : null,
      subtotal,
      tax,
      discount,
      grandTotal,
    };

    updateMutation.mutate({ id, payload });
  };

  if (loadingDetails) {
    return (
      <PageContainer>
        <div className="flex h-[400px] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading draft returns...</p>
        </div>
      </PageContainer>
    );
  }

  // Prevent edit if status is not draft
  if (purchaseReturn && purchaseReturn.status !== 'DRAFT') {
    return (
      <PageContainer>
        <div className="flex h-[400px] flex-col items-center justify-center gap-3 text-center max-w-md mx-auto">
          <p className="text-lg font-bold text-foreground">Action Forbidden</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Only returns in <strong className="text-primary">DRAFT</strong> state can be edited.
            This claim is currently in{' '}
            <strong className="text-amber-500">{purchaseReturn.status}</strong> state.
          </p>
          <Link href={`/purchase/returns/${id}`}>
            <Button size="sm" className="mt-2">
              View claim details
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Edit Purchase Return Claim`}
        description={`Update draft values and recheck document claims.`}
        actions={
          <Link href={`/purchase/returns/${id}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Cancel Edit
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3 text-sm">
          {/* Document configuration block */}
          <Card className="md:col-span-2 shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" /> Return Details & References
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Supplier selection (read only) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Supplier Partner
                  </label>
                  <select
                    disabled
                    {...register('supplierId')}
                    className="w-full text-sm rounded-lg border border-border bg-muted p-2 text-foreground/75 cursor-not-allowed focus:outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warehouse selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Warehouse Facility
                  </label>
                  <select
                    {...register('warehouseId')}
                    className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                  {errors.warehouseId && (
                    <p className="text-xs font-medium text-rose-500">
                      {errors.warehouseId.message}
                    </p>
                  )}
                </div>

                {/* Reference Type (read only) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Return Claim Against
                  </label>
                  <select
                    disabled
                    {...register('referenceType')}
                    className="w-full text-sm rounded-lg border border-border bg-muted p-2 text-foreground/75 cursor-not-allowed focus:outline-none"
                  >
                    <option value="NONE">Direct (No Reference)</option>
                    <option value="PO">Purchase Order (PO)</option>
                    <option value="GRN">Goods Receive Note (GRN)</option>
                    <option value="INVOICE">Supplier Invoice</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Side Configuration Panel */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Clipboard className="w-4 h-4 text-indigo-500" /> Vouchers & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Return Date
                </label>
                <Input
                  type="date"
                  {...register('returnDate')}
                  className="border-border bg-card text-foreground"
                />
                {errors.returnDate && (
                  <p className="text-xs font-medium text-rose-500">{errors.returnDate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Global Return Reason
                </label>
                <select
                  {...register('reason')}
                  className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="DAMAGED">Damaged Product</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="WRONG_PRODUCT">Wrong Product Sent</option>
                  <option value="WRONG_QUANTITY">Wrong Quantity Shipped</option>
                  <option value="QUALITY_ISSUE">Quality Issue</option>
                  <option value="PACKAGING_DAMAGE">Packaging Damaged</option>
                  <option value="SUPPLIER_ERROR">Supplier Error</option>
                  <option value="MANUAL_CORRECTION">Manual Correction</option>
                  <option value="OTHER">Other Reason</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Settlement Method
                </label>
                <select
                  {...register('returnMethod')}
                  className="w-full text-sm rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="CREDIT_NOTE">Supplier Credit Note</option>
                  <option value="REFUND">Refund / Cash Back</option>
                  <option value="REPLACEMENT">Product Replacement</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic product table */}
        <Card className="shadow-sm border-border bg-card text-sm">
          <CardHeader className="border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Products Return Checklist</CardTitle>
            {referenceType === 'NONE' && supplierId && (
              <ProductSelector
                onSelect={handleSelectProduct}
                placeholder="Find catalog item to return..."
              />
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                    <th className="p-3 pl-6">Product</th>
                    <th className="p-3">SKU</th>
                    {referenceType !== 'NONE' && (
                      <>
                        <th className="p-3 text-right">Doc Qty</th>
                        <th className="p-3 text-right">Rec Qty</th>
                      </>
                    )}
                    <th className="p-3 text-right">Return Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3">Reason</th>
                    {referenceType === 'NONE' && <th className="p-3 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-b last:border-0 border-border bg-card">
                      <td className="p-3 pl-6 font-semibold text-foreground">
                        {field.productName}
                        <input type="hidden" {...register(`items.${index}.productId`)} />
                        <input type="hidden" {...register(`items.${index}.productName`)} />
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {field.sku}
                        <input type="hidden" {...register(`items.${index}.sku`)} />
                      </td>
                      {referenceType !== 'NONE' && (
                        <>
                          <td className="p-3 text-right font-mono text-muted-foreground">
                            {field.orderedQty}
                            <input type="hidden" {...register(`items.${index}.orderedQty`)} />
                          </td>
                          <td className="p-3 text-right font-mono text-muted-foreground">
                            {field.receivedQty}
                            <input type="hidden" {...register(`items.${index}.receivedQty`)} />
                          </td>
                        </>
                      )}
                      <td className="p-3 text-right">
                        <Input
                          type="number"
                          {...register(`items.${index}.returnQty`)}
                          className="w-16 text-right font-mono h-8 border-border bg-card text-foreground"
                        />
                        {errors.items?.[index]?.returnQty && (
                          <p className="text-[10px] text-rose-500 font-medium">
                            {errors.items[index]?.returnQty?.message}
                          </p>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.unitPrice`)}
                          className="w-20 text-right font-mono h-8 border-border bg-card text-foreground"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          {...register(`items.${index}.reason`)}
                          className="text-xs rounded border border-border bg-card p-1.5 h-8 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="DAMAGED">Damaged Product</option>
                          <option value="EXPIRED">Expired</option>
                          <option value="WRONG_PRODUCT">Wrong Product</option>
                          <option value="WRONG_QUANTITY">Wrong Qty</option>
                          <option value="QUALITY_ISSUE">Quality Issue</option>
                          <option value="PACKAGING_DAMAGE">Packaging Damaged</option>
                          <option value="SUPPLIER_ERROR">Supplier Error</option>
                          <option value="MANUAL_CORRECTION">Manual Correction</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </td>
                      {referenceType === 'NONE' && (
                        <td className="p-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Remarks and Valuations */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Notes and remarks */}
          <Card className="md:col-span-2 shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                Notes & Remarks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Textarea
                {...register('notes')}
                rows={3}
                className="border-border bg-card text-foreground"
              />

              {/* Attachments foundation placeholder */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-2">
                  Upload Returns Vouchers (UI Foundation)
                </label>
                <div className="border border-dashed border-border/80 rounded-xl p-4 bg-muted/10 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20 transition-all duration-300">
                  <Paperclip className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-foreground font-medium">
                    Click to select files or drag-and-drop here
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Supports PDF, PNG, JPG up to 10MB
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Valuation Summary */}
          <Card className="shadow-sm border-border bg-card text-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-emerald-500" /> Valuation totals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal returned</span>
                <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Tax (+)</span>
                <span className="font-semibold text-foreground">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discounts (-)</span>
                <span className="font-semibold text-rose-500">-${discount.toFixed(2)}</span>
              </div>
              <div className="border-t border-dashed border-border/80 my-2 pt-2.5 flex justify-between items-baseline">
                <span className="font-bold text-foreground">Refund Claim Value</span>
                <span className="text-lg font-bold font-mono text-emerald-500">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>

              {errors.items && (
                <p className="text-xs font-medium text-rose-500 text-center">
                  {errors.items.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full mt-4 font-semibold"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving changes...
                  </>
                ) : (
                  'Save Return Claim'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </PageContainer>
  );
}

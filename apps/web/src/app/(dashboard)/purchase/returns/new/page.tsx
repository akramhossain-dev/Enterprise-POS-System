'use client';

import * as React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Loader2,
  Building2,
  Warehouse,
  Clipboard,
  Calendar,
  DollarSign,
  Paperclip,
} from 'lucide-react';
import { useCreatePurchaseReturn } from '@/hooks/use-purchase-return';
import { useSuppliers } from '@/hooks/use-supplier';
import { useWarehouses } from '@/hooks/use-warehouse';
import { purchaseOrderService } from '@/services/purchase-order.service';
import { goodsReceiveService } from '@/services/goods-receive.service';
import { supplierInvoiceService } from '@/services/supplier-invoice.service';
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

export default function CreatePurchaseReturnPage() {
  const router = useRouter();
  const createMutation = useCreatePurchaseReturn();

  const { data: supplierResponse } = useSuppliers({ page: 1, limit: 100 });
  const { data: warehouseResponse } = useWarehouses({ page: 1, limit: 100 });

  const suppliers = supplierResponse?.data || [];
  const warehouses = warehouseResponse?.data || [];

  // References state lists
  const [poList, setPoList] = React.useState<any[]>([]);
  const [grnList, setGrnList] = React.useState<any[]>([]);
  const [invoiceList, setInvoiceList] = React.useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = React.useState(false);

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
      referenceType: 'NONE',
      returnDate: new Date().toISOString().split('T')[0],
      returnMethod: 'CREDIT_NOTE',
      reason: 'DAMAGED',
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const supplierId = watch('supplierId');
  const warehouseId = watch('warehouseId');
  const referenceType = watch('referenceType');
  const referencePoId = watch('referencePoId');
  const referenceGrnId = watch('referenceGrnId');
  const referenceInvoiceId = watch('referenceInvoiceId');
  const items = watch('items') || [];
  const globalReason = watch('reason') || 'DAMAGED';

  // Fetch reference lists when supplier or type changes
  React.useEffect(() => {
    if (!supplierId || referenceType === 'NONE') {
      setPoList([]);
      setGrnList([]);
      setInvoiceList([]);
      return;
    }

    const fetchRefs = async () => {
      setLoadingRefs(true);
      try {
        if (referenceType === 'PO') {
          const res = await purchaseOrderService.getPOs({ supplierId, limit: 100 });
          setPoList(
            res.data.filter(
              (po) =>
                po.status === 'APPROVED' ||
                po.status === 'RECEIVED' ||
                po.status === 'PARTIALLY_RECEIVED',
            ),
          );
        } else if (referenceType === 'GRN') {
          const res = await goodsReceiveService.getGRNs({ supplierId, limit: 100 });
          setGrnList(res.data.filter((grn) => grn.status === 'COMPLETED'));
        } else if (referenceType === 'INVOICE') {
          const res = await supplierInvoiceService.getInvoices({ supplierId });
          setInvoiceList(res.data);
        }
      } catch {
        toast.error('Failed to load supplier document references.');
      } finally {
        setLoadingRefs(false);
      }
    };

    void fetchRefs();
  }, [supplierId, referenceType]);

  // Load items from selected reference document
  React.useEffect(() => {
    const loadItems = async () => {
      setValue('items', []);

      if (referenceType === 'PO' && referencePoId) {
        try {
          const doc = await purchaseOrderService.getPO(referencePoId);
          const mapped = (doc.items || []).map((it) => ({
            productId: it.productId,
            productName: it.product?.name || 'Unknown Product',
            sku: it.product?.sku || 'SKU-N/A',
            orderedQty: it.quantity,
            receivedQty: 0,
            returnQty: it.quantity,
            unitPrice: it.unitPrice,
            reason: globalReason,
            status: 'PENDING' as const,
          }));
          setValue('items', mapped);
          toast.success('Purchase Order items loaded successfully');
        } catch {
          toast.error('Failed to load Purchase Order details.');
        }
      } else if (referenceType === 'GRN' && referenceGrnId) {
        try {
          const doc = await goodsReceiveService.getGRN(referenceGrnId);
          const mapped = (doc.items || []).map((it) => ({
            productId: it.productId,
            productName: it.product?.name || 'Unknown Product',
            sku: it.product?.sku || 'SKU-N/A',
            orderedQty: it.quantity,
            receivedQty: it.receivedQuantity,
            returnQty: it.receivedQuantity,
            unitPrice: it.unitCost,
            reason: globalReason,
            status: 'PENDING' as const,
          }));
          setValue('items', mapped);
          toast.success('GRN received items loaded successfully');
        } catch {
          toast.error('Failed to load GRN details.');
        }
      } else if (referenceType === 'INVOICE' && referenceInvoiceId) {
        try {
          const doc = await supplierInvoiceService.getInvoice(referenceInvoiceId);
          // If invoice links back to GRN, load from GRN
          const grn = doc.goodsReceiveId
            ? await goodsReceiveService.getGRN(doc.goodsReceiveId)
            : null;
          const itemsToMap = grn?.items || [];
          const mapped = itemsToMap.map((it) => ({
            productId: it.productId,
            productName: it.product?.name || 'Unknown Product',
            sku: it.product?.sku || 'SKU-N/A',
            orderedQty: it.quantity,
            receivedQty: it.receivedQuantity,
            returnQty: it.receivedQuantity,
            unitPrice: it.unitCost,
            reason: globalReason,
            status: 'PENDING' as const,
          }));
          setValue('items', mapped);
          toast.success('Invoice matched items loaded successfully');
        } catch {
          toast.error('Failed to load Invoice details.');
        }
      }
    };

    void loadItems();
  }, [referencePoId, referenceGrnId, referenceInvoiceId, referenceType, setValue]);

  // Handle Manual Product Selection (For standalone direct returns)
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

  // Compute pricing summaries
  const subtotal = React.useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.returnQty) * Number(item.unitPrice), 0);
  }, [items]);

  const tax = Number((subtotal * 0.1).toFixed(2)); // Standard 10% estimation
  const discount = 0;
  const grandTotal = subtotal + tax - discount;

  // Form submission
  const onSubmit = (values: FormValues) => {
    const activeSupplier = suppliers.find((s) => s.id === values.supplierId);
    const activeWarehouse = warehouses.find((w) => w.id === values.warehouseId);

    const refPo = poList.find((p) => p.id === values.referencePoId);
    const refGrn = grnList.find((g) => g.id === values.referenceGrnId);
    const refInvoice = invoiceList.find((i) => i.id === values.referenceInvoiceId);

    const payload = {
      ...values,
      supplier: activeSupplier ? (activeSupplier as any) : null,
      warehouse: activeWarehouse ? (activeWarehouse as any) : null,
      referencePoNumber: refPo?.purchaseOrderNumber || null,
      referenceGrnNumber: refGrn?.grnNumber || null,
      referenceInvoiceNumber: refInvoice?.invoiceNumber || null,
      subtotal,
      tax,
      discount,
      grandTotal,
      createdBy: 'Operator Admin',
      attachments: ['return_receipt.pdf'],
    };

    createMutation.mutate(payload);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Create Purchase Return"
        description="Select document reference codes, pull inventory items, and log returns to claim supplier credit."
        actions={
          <Link href="/purchase/returns">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Returns
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3 text-sm">
          {/* Document configuration block */}
          <Card className="md:col-span-2 shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" /> Return Details & References
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Supplier selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Supplier Partner
                  </label>
                  <select
                    {...register('supplierId')}
                    className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Supplier Vendor...</option>
                    {suppliers
                      .filter((s) => s.status === 'ACTIVE')
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.companyName}
                        </option>
                      ))}
                  </select>
                  {errors.supplierId && (
                    <p className="text-xs font-medium text-rose-500">{errors.supplierId.message}</p>
                  )}
                </div>

                {/* Warehouse selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Warehouse Facility
                  </label>
                  <select
                    {...register('warehouseId')}
                    className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Warehouse...</option>
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

                {/* Reference Type selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Return Claim Against
                  </label>
                  <select
                    {...register('referenceType')}
                    disabled={!supplierId}
                    className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="NONE">Direct (No Reference)</option>
                    <option value="PO">Purchase Order (PO)</option>
                    <option value="GRN">Goods Receive Note (GRN)</option>
                    <option value="INVOICE">Supplier Invoice</option>
                  </select>
                </div>

                {/* Reference ID Selectors based on Type */}
                {referenceType === 'PO' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Reference Purchase Order
                    </label>
                    <select
                      {...register('referencePoId')}
                      disabled={loadingRefs}
                      className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 font-mono"
                    >
                      <option value="">Select PO Reference...</option>
                      {poList.map((po) => (
                        <option key={po.id} value={po.id}>
                          {po.purchaseOrderNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {referenceType === 'GRN' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Reference GRN Code
                    </label>
                    <select
                      {...register('referenceGrnId')}
                      disabled={loadingRefs}
                      className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 font-mono"
                    >
                      <option value="">Select GRN Reference...</option>
                      {grnList.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.grnNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {referenceType === 'INVOICE' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Reference Invoice Number
                    </label>
                    <select
                      {...register('referenceInvoiceId')}
                      disabled={loadingRefs}
                      className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 font-mono"
                    >
                      <option value="">Select Invoice Reference...</option>
                      {invoiceList.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.invoiceNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Side Configuration Panel */}
          <Card className="shadow-sm border-border bg-cardard">
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
                  className="border-border bg-cardard text-foreground"
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
                  className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
        <Card className="shadow-sm border-border bg-cardard text-sm">
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
                  {fields.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-muted-foreground italic">
                        {referenceType === 'NONE'
                          ? 'Please add product items using the selector above.'
                          : 'Select a supplier reference document above to automatically load items.'}
                      </td>
                    </tr>
                  ) : (
                    fields.map((field, index) => (
                      <tr key={field.id} className="border-b last:border-0 border-border bg-cardard">
                        <td className="p-3 pl-6 font-medium text-foreground">
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
                            className="w-16 text-right font-mono h-8 border-border bg-cardard text-foreground"
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
                            className="w-20 text-right font-mono h-8 border-border bg-cardard text-foreground"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            {...register(`items.${index}.reason`)}
                            className="text-xs rounded border border-border bg-cardard p-1.5 h-8 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Remarks and Valuations */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Notes and remarks */}
          <Card className="md:col-span-2 shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                Notes & Vouchers Remarks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Textarea
                placeholder="Provide details about return discrepancies, carrier logistics, and authorization codes..."
                {...register('notes')}
                rows={3}
                className="border-border bg-cardard text-foreground"
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
          <Card className="shadow-sm border-border bg-cardard text-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-emerald-500" /> Estimations summary
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
                disabled={createMutation.isPending}
                className="w-full mt-4 font-semibold"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Initializing...
                  </>
                ) : (
                  'File Return Voucher'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </PageContainer>
  );
}

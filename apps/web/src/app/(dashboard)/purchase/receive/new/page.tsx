'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Loader2,
  Package,
  Layers,
  DollarSign,
  Building,
} from 'lucide-react';
import { useCreateGRN } from '@/hooks/use-goods-receive';
import { usePurchaseOrders } from '@/hooks/use-purchase';
import { purchaseOrderService } from '@/services/purchase-order.service';
import { BatchSelector } from '@/components/receive/batch-selector';
import { SerialSelector } from '@/components/receive/serial-selector';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const schema = z.object({
  purchaseOrderId: z.string().min(1, 'Please select a Purchase Order to receive against'),
  supplierId: z.string().min(1, 'Supplier is required'),
  supplierName: z.string(),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  warehouseName: z.string(),
  branchId: z.string().nullable().optional(),
  grnNumber: z.string().min(1, 'Please enter a GRN code'),
  receiveDate: z.string().min(1, 'Date required'),
  remarks: z.string().optional(),
  discount: z.coerce.number().min(0),
  tax: z.coerce.number().min(0),
  items: z
    .array(
      z.object({
        productId: z.string(),
        productName: z.string(),
        sku: z.string(),
        orderedQty: z.number(),
        receivedQuantity: z.coerce.number().min(1, 'Received quantity must be at least 1'),
        rejectedQuantity: z.coerce.number().min(0, 'Rejected quantity cannot be negative'),
        acceptedQuantity: z.number(),
        unitCost: z.coerce.number().min(0.01, 'Unit cost is required'),
        batchNumber: z.string().optional(),
        expiryDate: z.string().optional(),
        serialRequired: z.boolean(),
        serials: z.array(z.string()),
        subtotal: z.number(),
      }),
    )
    .min(1, 'Please configure products to receive'),
});

type FormValues = z.infer<typeof schema>;

export default function ReceivePurchaseOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poId = searchParams.get('poId');

  const createMutation = useCreateGRN();

  // Fetch approved or partially received purchase orders
  const { data: poResponse, isLoading: isLoadingPOs } = usePurchaseOrders({
    page: 1,
    limit: 100,
  });

  const activePOs =
    poResponse?.data?.filter((o) =>
      ['APPROVED', 'PARTIALLY_RECEIVED'].includes(o.status.toUpperCase()),
    ) || [];

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
    defaultValues: {
      grnNumber: `GRN-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      receiveDate: new Date().toISOString().split('T')[0] || '',
      discount: 0,
      tax: 0,
      items: [],
      branchId: null,
    },
  });

  const selectedPoId = watch('purchaseOrderId');
  const items = watch('items') || [];
  const discount = watch('discount') || 0;
  const tax = watch('tax') || 0;

  // Load PO details when chosen
  React.useEffect(() => {
    if (selectedPoId) {
      const loadPo = async () => {
        try {
          const po = await purchaseOrderService.getPO(selectedPoId);
          setValue('supplierId', po.supplierId);
          setValue('supplierName', po.supplier?.companyName || 'Supplier');
          setValue('warehouseId', po.warehouseId);
          setValue('warehouseName', po.warehouse?.name || 'Warehouse Depot');
          setValue('branchId', po.branchId);
          setValue(
            'items',
            po.items.map((i) => {
              const qtyVal = Number(i.quantity);
              const costVal = Number(i.unitPrice);
              return {
                productId: i.productId,
                productName: i.product?.name || 'Unknown Item',
                sku: i.product?.sku || 'N/A',
                orderedQty: qtyVal,
                receivedQuantity: qtyVal,
                rejectedQuantity: 0,
                acceptedQuantity: qtyVal,
                unitCost: costVal,
                batchNumber: '',
                expiryDate: '',
                serialRequired: false,
                serials: [],
                subtotal: qtyVal * costVal,
              };
            }),
          );
        } catch {
          toast.error('Could not load purchase order details.');
        }
      };
      void loadPo();
    }
  }, [selectedPoId, setValue]);

  // Compute pricing totals
  const subtotalSum = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.receivedQuantity * item.unitCost, 0);
  }, [items]);

  const grandTotal = subtotalSum - discount + tax;

  const handleUpdateReceivedQty = (index: number, val: number) => {
    const updated = [...items];
    const target = updated[index];
    if (!target) return;
    target.receivedQuantity = val;
    target.acceptedQuantity = val - target.rejectedQuantity;
    target.subtotal = val * target.unitCost;
    setValue('items', updated);
  };

  const handleUpdateRejectedQty = (index: number, val: number) => {
    const updated = [...items];
    const target = updated[index];
    if (!target) return;
    target.rejectedQuantity = val;
    target.acceptedQuantity = target.receivedQuantity - val;
    setValue('items', updated);
  };

  const handleUpdateCost = (index: number, val: number) => {
    const updated = [...items];
    const target = updated[index];
    if (!target) return;
    target.unitCost = val;
    target.subtotal = target.receivedQuantity * val;
    setValue('items', updated);
  };

  const handleUpdateBatch = (index: number, field: 'batchNumber' | 'expiryDate', val: string) => {
    const updated = [...items];
    const target = updated[index];
    if (!target) return;
    target[field] = val;
    setValue('items', updated);
  };

  const handleUpdateSerials = (index: number, serialList: string[]) => {
    const updated = [...items];
    const target = updated[index];
    if (!target) return;
    target.serials = serialList;
    setValue('items', updated);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        companyId: '11111111-1111-1111-1111-111111111111',
        branchId: values.branchId || null,
        warehouseId: values.warehouseId,
        supplierId: values.supplierId,
        purchaseOrderId: values.purchaseOrderId,
        receiveDate: new Date(values.receiveDate).toISOString(),
        discount,
        tax,
        remarks: values.remarks || null,
        items: values.items.map((i) => ({
          productId: i.productId,
          quantity: i.orderedQty,
          receivedQuantity: i.receivedQuantity,
          unitCost: i.unitCost,
          batchNumber: i.batchNumber || null,
          expiryDate: i.expiryDate ? new Date(i.expiryDate).toISOString() : null,
          serialRequired: i.serialRequired,
        })),
      });
    } catch {}
  };

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/purchase/receive">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            &larr; Back to Dashboard
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Receive Purchase Order Cargo"
        description="Verify quantities received from supplier deliveries, assign batches, manufacturing/expiry dates, and record rejected items."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-sm">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main items panel */}
          <Card className="md:col-span-2 shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Delivery Items & Inspections
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* PO select option */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Select Purchase Order
                </label>
                <select
                  {...register('purchaseOrderId')}
                  className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
                >
                  <option value="">Choose active Purchase Order shipment...</option>
                  {activePOs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.purchaseOrderNumber} — {o.supplier?.companyName} (
                      {new Date(o.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {errors.purchaseOrderId && (
                  <p className="text-xs text-rose-500 font-semibold">
                    {errors.purchaseOrderId.message}
                  </p>
                )}
              </div>

              {/* Items grid */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border font-semibold text-muted-foreground">
                      <th className="p-3 pl-6">Product Details</th>
                      <th className="p-3 text-center">Ordered</th>
                      <th className="p-3 text-center w-20">Received</th>
                      <th className="p-3 text-center w-20">Rejected</th>
                      <th className="p-3 text-center w-20 font-bold">Accepted</th>
                      <th className="p-3 text-right w-24">Unit Cost</th>
                      <th className="p-3 pr-6 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-muted-foreground italic">
                          No Purchase Order chosen. Select a PO above to load item deliveries.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <React.Fragment key={item.productId}>
                          {/* Row 1: Core fields */}
                          <tr className="border-b border-border/40 bg-cardard hover:bg-muted/5">
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
                            <td className="p-3 text-center font-mono font-semibold text-muted-foreground">
                              {item.orderedQty}
                            </td>
                            <td className="p-3 text-center">
                              <Input
                                type="number"
                                min="1"
                                value={item.receivedQuantity}
                                onChange={(e) =>
                                  handleUpdateReceivedQty(index, Number(e.target.value))
                                }
                                className="h-8 text-center bg-muted/10 font-semibold text-xs"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <Input
                                type="number"
                                min="0"
                                value={item.rejectedQuantity}
                                onChange={(e) =>
                                  handleUpdateRejectedQty(index, Number(e.target.value))
                                }
                                className="h-8 text-center bg-muted/10 font-semibold text-xs"
                              />
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-emerald-500">
                              {item.acceptedQuantity}
                            </td>
                            <td className="p-3 text-right">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.unitCost}
                                onChange={(e) => handleUpdateCost(index, Number(e.target.value))}
                                className="h-8 text-right bg-muted/10 font-mono text-xs"
                              />
                            </td>
                            <td className="p-3 text-right pr-6 font-mono font-bold text-foreground">
                              ${(item.receivedQuantity * item.unitCost).toFixed(2)}
                            </td>
                          </tr>

                          {/* Row 2: Lot/Batch and Serial configuration */}
                          <tr className="border-b border-border bg-muted/10">
                            <td
                              colSpan={7}
                              className="p-3.5 pl-6 flex flex-wrap gap-4 items-center bg-muted/5"
                            >
                              {/* Batch Selector */}
                              <BatchSelector
                                batchNumber={item.batchNumber || ''}
                                expiryDate={item.expiryDate || ''}
                                onChangeBatch={(val) =>
                                  handleUpdateBatch(index, 'batchNumber', val)
                                }
                                onChangeExpiry={(val) =>
                                  handleUpdateBatch(index, 'expiryDate', val)
                                }
                              />

                              {/* Serial configurations toggle */}
                              <div className="flex items-center gap-2 pt-4">
                                <input
                                  type="checkbox"
                                  id={`serial-req-${index}`}
                                  checked={item.serialRequired}
                                  onChange={(e) => {
                                    const updated = [...items];
                                    if (updated[index]) {
                                      updated[index].serialRequired = e.target.checked;
                                      setValue('items', updated);
                                    }
                                  }}
                                  className="rounded border-border bg-cardard"
                                />
                                <label
                                  htmlFor={`serial-req-${index}`}
                                  className="text-[10px] uppercase font-bold text-muted-foreground"
                                >
                                  Track Serial Codes
                                </label>

                                {item.serialRequired && (
                                  <SerialSelector
                                    serials={item.serials}
                                    requiredCount={item.acceptedQuantity}
                                    onChangeSerials={(serials) =>
                                      handleUpdateSerials(index, serials)
                                    }
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Right sidebar config panel */}
          <div className="space-y-6">
            <Card className="shadow-sm border-border bg-cardard">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" /> Delivery Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* GRN number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Goods Receive Note Code
                  </label>
                  <Input
                    {...register('grnNumber')}
                    className="bg-muted/10 border-border font-semibold font-mono"
                  />
                  {errors.grnNumber && (
                    <p className="text-xs text-rose-500">{errors.grnNumber.message}</p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Cargo Delivery Date
                  </label>
                  <Input
                    type="date"
                    {...register('receiveDate')}
                    className="bg-muted/10 border-border"
                  />
                  {errors.receiveDate && (
                    <p className="text-xs text-rose-500">{errors.receiveDate.message}</p>
                  )}
                </div>

                {/* Supplier */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase block font-bold">
                    Supplier Vendor
                  </span>
                  <span className="text-foreground text-sm font-semibold flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-indigo-500 shrink-0" />
                    {watch('supplierName') || 'Choose a PO...'}
                  </span>
                </div>

                {/* Warehouse */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase block font-bold">
                    Target Warehouse
                  </span>
                  <span className="text-foreground text-sm font-semibold">
                    {watch('warehouseName') || 'Choose a PO...'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-cardard">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold">Summary & Commit</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Global charges inputs */}
                <div className="grid gap-2 grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Glob. Discount
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('discount')}
                      className="h-8 bg-muted/10 font-mono text-xs text-right"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Glob. Tax
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('tax')}
                      className="h-8 bg-muted/10 font-mono text-xs text-right"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Receiving Remarks
                  </label>
                  <Textarea
                    {...register('remarks')}
                    placeholder="Enter delivery exceptions, cargo conditions..."
                    rows={3}
                    className="bg-muted/10 border-border"
                  />
                </div>

                {/* Financial Summary */}
                <div className="border-t border-dashed pt-4 space-y-2 text-xs font-semibold text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Goods Subtotal:</span>
                    <span className="font-mono text-foreground">${subtotalSum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="font-mono text-rose-500">-${discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-mono text-foreground">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-bold text-foreground">
                    <span>GRAND TOTAL:</span>
                    <span className="text-primary font-mono">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Register Intake Draft (GRN)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}

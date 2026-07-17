'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, FileText, Calendar, Building, DollarSign } from 'lucide-react';
import { useCreateSupplierInvoice, useGRNs } from '@/hooks/use-goods-receive';
import { goodsReceiveService } from '@/services/goods-receive.service';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const schema = z.object({
  goodsReceiveId: z.string().min(1, 'Please select a Goods Receive Note (GRN) reference'),
  invoiceNumber: z.string().min(1, 'Invoice number is required').max(100),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  subtotal: z.coerce.number().positive('Subtotal must be positive'),
  tax: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  grandTotal: z.coerce.number().positive(),
  supplierName: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewSupplierInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goodsReceiveId = searchParams.get('goodsReceiveId');

  const createMutation = useCreateSupplierInvoice();

  // Load completed GRNs that are not yet invoiced
  const { data: grnResponse, isLoading: isLoadingGRNs } = useGRNs({
    page: 1,
    limit: 100,
    status: 'COMPLETED',
  });

  const grns = grnResponse?.data || [];
  // Filter client-side to only show GRNs without invoices
  const uninvoicedGRNs = React.useMemo(() => {
    return grns.filter((g) => !g.invoice);
  }, [grns]);

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
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      invoiceDate: new Date().toISOString().split('T')[0] || '',
      subtotal: 0.01,
      tax: 0,
      discount: 0,
      grandTotal: 0.01,
    },
  });

  const selectedGrnId = watch('goodsReceiveId');
  const subtotal = watch('subtotal') || 0;
  const tax = watch('tax') || 0;
  const discount = watch('discount') || 0;

  // Auto compute grand total
  const calculatedGrandTotal = React.useMemo(() => {
    return subtotal - discount + tax;
  }, [subtotal, discount, tax]);

  React.useEffect(() => {
    setValue('grandTotal', calculatedGrandTotal);
  }, [calculatedGrandTotal, setValue]);

  // Load details from GRN when selected
  React.useEffect(() => {
    if (selectedGrnId) {
      const loadGRN = async () => {
        try {
          const grn = await goodsReceiveService.getGRN(selectedGrnId);
          setValue('subtotal', Number(grn.subtotal));
          setValue('discount', Number(grn.discount));
          setValue('tax', Number(grn.tax));
          setValue('supplierName', grn.supplier?.companyName || 'Supplier Partner');
        } catch {
          toast.error('Could not load Goods Receive Note details.');
        }
      };
      void loadGRN();
    }
  }, [selectedGrnId, setValue]);

  // Pre-load from query param if available
  React.useEffect(() => {
    if (goodsReceiveId) {
      setValue('goodsReceiveId', goodsReceiveId);
    }
  }, [goodsReceiveId, setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        goodsReceiveId: values.goodsReceiveId,
        invoiceNumber: values.invoiceNumber,
        invoiceDate: new Date(values.invoiceDate).toISOString(),
        tax: values.tax,
        discount: values.discount,
        subtotal: values.subtotal,
        grandTotal: values.grandTotal,
      });
    } catch {}
  };

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/purchase/invoices">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            &larr; Back to Invoices
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Register Supplier Invoice"
        description="Raise a supplier invoice accounts payable profile against completed stock receiving logs (GRN)."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-sm">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Form details card */}
          <Card className="md:col-span-2 shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary animate-pulse" /> Invoice Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Select GRN */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Select Goods Receive Note (GRN)
                </label>
                <select
                  {...register('goodsReceiveId')}
                  className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
                >
                  <option value="">Select completed receiving log...</option>
                  {uninvoicedGRNs.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.grnNumber} — {g.supplier?.companyName} (${Number(g.grandTotal).toFixed(2)})
                    </option>
                  ))}
                </select>
                {errors.goodsReceiveId && (
                  <p className="text-xs text-rose-500 font-semibold">
                    {errors.goodsReceiveId.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Invoice Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Invoice Number
                  </label>
                  <Input
                    {...register('invoiceNumber')}
                    className="bg-muted/10 border-border font-semibold font-mono"
                  />
                  {errors.invoiceNumber && (
                    <p className="text-xs text-rose-500">{errors.invoiceNumber.message}</p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Invoice Issue Date
                  </label>
                  <Input
                    type="date"
                    {...register('invoiceDate')}
                    className="bg-muted/10 border-border"
                  />
                  {errors.invoiceDate && (
                    <p className="text-xs text-rose-500">{errors.invoiceDate.message}</p>
                  )}
                </div>
              </div>

              {/* Vendor info */}
              {watch('supplierName') && (
                <div className="bg-muted/20 rounded-lg p-3.5 border text-xs">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                    Supplier Partner
                  </span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-500" />
                    {watch('supplierName')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing breakdowns */}
          <Card className="shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold">Financial Reconciliation</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Subtotal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Goods Subtotal
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('subtotal')}
                  className="bg-muted/10 border-border font-mono font-semibold text-right"
                />
                {errors.subtotal && (
                  <p className="text-xs text-rose-500">{errors.subtotal.message}</p>
                )}
              </div>

              <div className="grid gap-2 grid-cols-2">
                {/* Discount */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                    Discount (-)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('discount')}
                    className="h-8 bg-muted/10 font-mono text-xs text-right"
                  />
                </div>
                {/* Tax */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                    Taxes (+)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('tax')}
                    className="h-8 bg-muted/10 font-mono text-xs text-right"
                  />
                </div>
              </div>

              <div className="border-t border-dashed pt-4 flex justify-between items-center text-sm font-bold">
                <span className="uppercase text-xs text-muted-foreground">Invoice Total:</span>
                <span className="text-primary font-mono text-base flex items-center">
                  <DollarSign className="w-4 h-4 shrink-0" />
                  {calculatedGrandTotal.toFixed(2)}
                </span>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Commit Supplier Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </PageContainer>
  );
}

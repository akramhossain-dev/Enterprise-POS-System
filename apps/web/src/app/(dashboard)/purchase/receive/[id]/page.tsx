'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Package,
  User,
  Warehouse as WarehouseIcon,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Trash2,
  Edit,
  DollarSign,
  Loader2,
  CopyCheck,
  Scale,
} from 'lucide-react';
import { useGRNDetails, useCompleteGRN, useCancelGRN } from '@/hooks/use-goods-receive';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/purchase/status-badge';
import { ReceivingTimeline } from '@/components/receive/receiving-timeline';
import { toast } from 'sonner';

export default function GoodsReceiveDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params['id'] as string;

  const { data: grn, isLoading, error, refetch } = useGRNDetails(id);

  const completeMutation = useCompleteGRN();
  const cancelMutation = useCancelGRN();

  const handleComplete = async () => {
    if (
      window.confirm(
        'Committing this GRN will finalize quantities and update warehouse stock levels. Proceed?',
      )
    ) {
      try {
        await completeMutation.mutateAsync(id);
        void refetch();
      } catch {}
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this Goods Receive Note?')) {
      try {
        await cancelMutation.mutateAsync(id);
        void refetch();
      } catch {}
    }
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
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="md:col-span-2 h-96 w-full rounded-xl" />
            <Skeleton className="h-60 w-full rounded-xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !grn) {
    return (
      <PageContainer>
        <div className="text-center py-16 bg-cardard border rounded-2xl text-sm">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">Goods Receive Note Not Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The requested GRN does not exist or has been deleted.
          </p>
          <Link href="/purchase/receive/list" className="inline-block mt-4">
            <Button size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Directory
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isDraft = grn.status === 'DRAFT';
  const isCompleted = grn.status === 'COMPLETED';
  const isCancelled = grn.status === 'CANCELLED';

  const grnSubtotal = Number(grn.subtotal);
  const grnDiscount = Number(grn.discount);
  const grnTax = Number(grn.tax);
  const grnTotal = Number(grn.grandTotal);

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/purchase/receive/list">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Active Logs
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Goods Receive Note: ${grn.grnNumber}`}
        description={`Inbound shipment verified on ${new Date(grn.receiveDate).toLocaleString()}`}
      />

      <div className="grid gap-6 md:grid-cols-3 text-sm">
        {/* Left items table */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary animate-pulse" /> Received Cargo Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                    <th className="p-3 pl-6">Product details</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Batch Reference</th>
                    <th className="p-3 text-right">PO Ordered</th>
                    <th className="p-3 text-right">Received</th>
                    <th className="p-3 text-right pr-6">Unit Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {grn.items?.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 border-border bg-cardard hover:bg-muted/10"
                    >
                      <td className="p-3 pl-6 font-semibold text-foreground text-sm">
                        {item.product?.name || '—'}
                      </td>
                      <td className="p-3 text-muted-foreground font-mono">
                        {item.product?.sku || 'N/A'}
                      </td>
                      <td className="p-3 text-muted-foreground font-medium">
                        {item.batchNumber ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {item.batchNumber}
                            </span>
                            {item.expiryDate && (
                              <span className="text-[9px] text-muted-foreground">
                                Exp: {new Date(item.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground/50">None Assigned</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono text-muted-foreground">
                        {Number(item.quantity).toFixed(0)} units
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-500">
                        {Number(item.receivedQuantity).toFixed(0)} units
                      </td>
                      <td className="p-3 text-right pr-6 font-mono font-bold">
                        ${Number(item.unitCost).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card className="shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" /> Received Cargo Valuation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid gap-6 sm:grid-cols-2 text-xs font-semibold">
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-mono text-foreground">${grnSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Discount Applied:</span>
                  <span className="font-mono text-rose-500">-${grnDiscount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Taxes Applied:</span>
                  <span className="font-mono text-foreground">${grnTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t text-sm font-bold text-foreground">
                  <span>Grand Total received:</span>
                  <span className="text-primary font-mono">${grnTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side stats panel */}
        <div className="space-y-6">
          {/* Status and Commit triggers */}
          <Card className="shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary animate-pulse" /> Intake Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                  Receipt Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={grn.status} />
                </div>
              </div>

              {isDraft && (
                <div className="space-y-2 border-t pt-4">
                  <span className="text-xs text-muted-foreground font-semibold block">
                    Cargo Approvals
                  </span>
                  <Button
                    onClick={handleComplete}
                    disabled={completeMutation.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  >
                    {completeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Complete & Commit Stock
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="w-full text-rose-500 hover:bg-rose-500/5 gap-1.5"
                  >
                    Cancel Receipt Log
                  </Button>
                </div>
              )}

              {isCompleted && (
                <div className="space-y-2 border-t pt-4">
                  <span className="text-xs text-muted-foreground font-semibold block">
                    Accounting Integrations
                  </span>
                  {grn.invoice ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <p className="font-semibold text-emerald-500">Invoiced</p>
                        <p className="text-muted-foreground mt-0.5">Supplier Invoice registered.</p>
                        <Link
                          href={`/purchase/invoices/${grn.invoice.id}`}
                          className="text-primary hover:underline font-semibold block mt-1.5"
                        >
                          View Invoice &rarr;
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={`/purchase/invoices/new?goodsReceiveId=${grn.id}`}
                      className="w-full block"
                    >
                      <Button className="w-full bg-primary hover:bg-primary/95 text-primary-foreground gap-1.5">
                        <CopyCheck className="w-4 h-4" /> Generate Supplier Invoice
                      </Button>
                    </Link>
                  )}
                  <Link
                    href={`/purchase/matching?goodsReceiveId=${grn.id}`}
                    className="w-full block"
                  >
                    <Button variant="outline" className="w-full gap-1.5">
                      <Scale className="w-4 h-4" /> Audit 3-Way Match
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supplier Info */}
          <Card className="shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-500" /> Supplier Vendor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                  Vendor Partner
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {grn.supplier?.companyName}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                  Warehouse Depot
                </span>
                <span className="text-foreground">{grn.warehouse?.name}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline steps */}
          <ReceivingTimeline
            status={grn.status}
            hasInvoice={!!grn.invoice}
            isMatched={!!grn.invoice} // Simplified for indicator
            receiveDate={grn.receiveDate}
            invoiceDate={grn.invoice?.invoiceDate}
          />
        </div>
      </div>
    </PageContainer>
  );
}

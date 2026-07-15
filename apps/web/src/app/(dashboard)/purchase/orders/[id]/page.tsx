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
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Printer,
  Building2,
  Trash2,
  Edit,
  DollarSign,
  Loader2,
} from 'lucide-react';
import {
  usePurchaseOrderDetails,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useCancelPurchaseOrder,
  useDeletePurchaseOrder,
} from '@/hooks/use-purchase';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/purchase/status-badge';
import { ApprovalTimeline } from '@/components/purchase/approval-timeline';
import { toast } from 'sonner';

export default function PurchaseOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params['id'] as string;

  const { data: po, isLoading, error, refetch } = usePurchaseOrderDetails(id);

  const submitMutation = useSubmitPurchaseOrder();
  const approveMutation = useApprovePurchaseOrder();
  const rejectMutation = useRejectPurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();
  const deleteMutation = useDeletePurchaseOrder();

  const handlePrint = () => {
    toast.info('Printing purchase order layout slip (UI Only)...');
  };

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this purchase order draft?')) {
      try {
        await deleteMutation.mutateAsync(id);
        router.push('/purchase/orders');
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

  if (error || !po) {
    return (
      <PageContainer>
        <div className="text-center py-16 bg-card border rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">Order Not Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The requested purchase order record does not exist or you lack sufficient access
            permissions.
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

  const isDraft = po.status === 'DRAFT';
  const isPending = po.status === 'PENDING';
  const isApproved = po.status === 'APPROVED';

  const poSubtotal = Number(po.subtotal);
  const poDiscount = Number(po.discount);
  const poTax = Number(po.tax);
  const poShipping = Number(po.shippingCost);
  const poGrandTotal = Number(po.grandTotal);

  return (
    <PageContainer>
      <div className="mb-4 flex justify-between items-center">
        <Link href="/purchase/orders">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Directory
          </Button>
        </Link>
        <div className="flex gap-2">
          {isDraft && (
            <>
              <Link href={`/purchase/orders/${id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Edit className="w-4 h-4" /> Edit Order
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-rose-500 hover:bg-rose-500/5 gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="w-4 h-4" /> Print PO Slip
          </Button>
        </div>
      </div>

      <PageHeader
        title={`Purchase Order: ${po.purchaseOrderNumber}`}
        description={`Procurement purchase order created on ${new Date(po.createdAt).toLocaleString()}`}
      />

      <div className="grid gap-6 md:grid-cols-3 text-sm">
        {/* Left item grid list */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Purchase Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                    <th className="p-3 pl-6">Product details</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Unit price</th>
                    <th className="p-3 text-right">Discount</th>
                    <th className="p-3 text-right">Tax</th>
                    <th className="p-3 text-right pr-6">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {po.items?.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 border-border bg-card hover:bg-muted/10"
                    >
                      <td className="p-3 pl-6 font-semibold text-foreground text-sm">
                        {item.product?.name || '—'}
                      </td>
                      <td className="p-3 text-muted-foreground font-mono">
                        {item.product?.sku || 'N/A'}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {Number(item.quantity).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono">
                        ${Number(item.unitPrice).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-500">
                        -${Number(item.discount).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono">${Number(item.tax).toFixed(2)}</td>
                      <td className="p-3 text-right pr-6 font-mono font-bold text-foreground">
                        ${Number(item.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Pricing breakdowns details */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" /> Invoice Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid gap-6 sm:grid-cols-2 text-xs font-semibold">
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Order Subtotal:</span>
                  <span className="font-mono text-foreground">${poSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Item-level Discounts:</span>
                  <span className="font-mono text-rose-500">
                    -${po.items.reduce((sum, i) => sum + Number(i.discount), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Global Discount:</span>
                  <span className="font-mono text-rose-500">-${poDiscount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Logistics Shipping:</span>
                  <span className="font-mono text-foreground">${poShipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Accumulated Taxes:</span>
                  <span className="font-mono text-foreground">${poTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t text-sm font-bold text-foreground">
                  <span>Grand Total Spends:</span>
                  <span className="text-primary font-mono">${poGrandTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side stats */}
        <div className="space-y-6">
          {/* Status & Approvals visual workflow */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" /> Approvals Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                  Order Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={po.status} />
                </div>
              </div>

              {isDraft && (
                <div className="border-t pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                  >
                    {submitMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Submit Order
                  </Button>
                </div>
              )}

              {isPending && (
                <div className="space-y-2 border-t pt-4">
                  <span className="text-xs text-muted-foreground font-semibold block">
                    Approval Signatures
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      disabled={rejectMutation.isPending || approveMutation.isPending}
                      className="text-rose-500 hover:bg-rose-500/5 hover:text-rose-600 gap-1"
                    >
                      {rejectMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              )}

              {isApproved && (
                <div className="space-y-2 border-t pt-4">
                  <span className="text-xs text-muted-foreground font-semibold block">
                    Commit Actions
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="w-full text-rose-500 hover:bg-rose-500/5 gap-1"
                  >
                    Cancel Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supplier Info */}
          <Card className="shadow-sm border-border bg-card">
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
                  {po.supplier?.companyName}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                  Contact Person
                </span>
                <span className="text-foreground">{po.supplier?.contactPerson || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                  Phone / Email
                </span>
                <span className="text-muted-foreground">{po.supplier?.phone || '—'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Warehouse Route */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <WarehouseIcon className="w-4 h-4 text-primary" /> Delivery Depot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                  Depot Facility
                </span>
                <span className="font-semibold text-foreground text-sm">{po.warehouse?.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                  Expected Date
                </span>
                <span className="text-foreground">
                  {po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : 'Immediate'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline steps */}
          <ApprovalTimeline
            status={po.status}
            createdDate={po.createdAt}
            updatedDate={po.updatedAt}
            creatorId={po.createdBy}
            approverId={po.approvedBy}
          />
        </div>
      </div>
    </PageContainer>
  );
}

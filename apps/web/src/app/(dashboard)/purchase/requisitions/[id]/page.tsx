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
  Truck,
  Building2,
  Trash2,
  Edit,
  ArrowRight,
  Loader2,
  CopyCheck,
} from 'lucide-react';
import {
  usePurchaseRequisitionDetails,
  useSubmitPurchaseRequisition,
  useApprovePurchaseRequisition,
  useRejectPurchaseRequisition,
  useCancelPurchaseRequisition,
  useDeletePurchaseRequisition,
} from '@/hooks/use-purchase';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/purchase/status-badge';
import { toast } from 'sonner';

export default function RequisitionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params['id'] as string;

  const { data: requisition, isLoading, error, refetch } = usePurchaseRequisitionDetails(id);

  const submitMutation = useSubmitPurchaseRequisition();
  const approveMutation = useApprovePurchaseRequisition();
  const rejectMutation = useRejectPurchaseRequisition();
  const cancelMutation = useCancelPurchaseRequisition();
  const deleteMutation = useDeletePurchaseRequisition();

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
    if (window.confirm('Are you sure you want to delete this requisition draft?')) {
      try {
        await deleteMutation.mutateAsync(id);
        router.push('/purchase/requisitions');
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

  if (error || !requisition) {
    return (
      <PageContainer>
        <div className="text-center py-16 bg-cardard border rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">Requisition Not Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The requested purchase requisition does not exist or you lack sufficient access.
          </p>
          <Link href="/purchase/requisitions" className="inline-block mt-4">
            <Button size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Requisitions
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isDraft = requisition.status === 'DRAFT';
  const isPending = requisition.status === 'PENDING_APPROVAL';
  const isApproved = requisition.status === 'APPROVED';
  const isConverted = requisition.status === 'CONVERTED';

  return (
    <PageContainer>
      <div className="mb-4 flex justify-between items-center">
        <Link href="/purchase/requisitions">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Directory
          </Button>
        </Link>
        {isDraft && (
          <div className="flex gap-2">
            <Link href={`/purchase/requisitions/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit className="w-4 h-4" /> Edit Requisition
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
          </div>
        )}
      </div>

      <PageHeader
        title={requisition.title}
        description={`Stock requisition raised by ${requisition.requestedBy} for the ${requisition.department} department.`}
      />

      <div className="grid gap-6 md:grid-cols-3 text-sm">
        {/* Left items grid */}
        <Card className="md:col-span-2 shadow-sm border-border bg-cardard">
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Requested Procurement Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                  <th className="p-3 pl-6">Product Details</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Est. Unit Cost</th>
                  <th className="p-3 text-right pr-6">Estimated Cost</th>
                </tr>
              </thead>
              <tbody>
                {requisition.items?.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-b-0 border-border bg-cardard hover:bg-muted/10"
                  >
                    <td className="p-3 pl-6 font-semibold text-foreground text-sm">
                      {item.productName}
                    </td>
                    <td className="p-3 text-muted-foreground font-mono">{item.sku}</td>
                    <td className="p-3 text-right font-mono font-semibold">{item.quantity}</td>
                    <td className="p-3 text-right font-mono">
                      ${Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="p-3 text-right pr-6 font-mono font-bold text-foreground">
                      ${Number(item.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Right sidebar details */}
        <div className="space-y-6">
          {/* Workflow Status Controls */}
          <Card className="shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" /> Workflow Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                    Requisition Status
                  </span>
                  <div className="mt-1">
                    <StatusBadge status={requisition.status} />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                    Priority
                  </span>
                  <div className="mt-1">
                    <StatusBadge status={requisition.priority} />
                  </div>
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
                    Submit Requisition
                  </Button>
                </div>
              )}

              {isPending && (
                <div className="space-y-2 border-t pt-4">
                  <span className="text-xs text-muted-foreground font-semibold block">
                    Approvals Panel
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
                    Procurement Actions
                  </span>
                  <Link href={`/purchase/orders/new?requisitionId=${id}`} className="w-full block">
                    <Button className="w-full bg-primary hover:bg-primary/95 text-primary-foreground gap-1.5">
                      <CopyCheck className="w-4 h-4" /> Convert to Purchase Order
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="w-full text-rose-500 hover:bg-rose-500/5 gap-1"
                  >
                    Cancel Requisition
                  </Button>
                </div>
              )}

              {isConverted && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg flex items-start gap-2 mt-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-500">Purchase Order Generated</p>
                    <p className="text-muted-foreground mt-0.5">
                      This requisition has been fulfilled. Click below to view the linked Purchase
                      Order.
                    </p>
                    {requisition.convertedPoId && (
                      <Link
                        href={`/purchase/orders/${requisition.convertedPoId}`}
                        className="text-primary hover:underline font-semibold block mt-1.5"
                      >
                        View Purchase Order &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supplier & Warehouse info */}
          <Card className="shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-500" /> Procurement Targets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <span className="text-muted-foreground block uppercase text-[10px]">
                  Supplier Vendor
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {requisition.supplierName}
                </span>
              </div>
              <div className="border-t pt-3">
                <span className="text-muted-foreground block uppercase text-[10px]">
                  Destination Depot
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {requisition.warehouseName}
                </span>
              </div>
              <div className="border-t pt-3">
                <span className="text-muted-foreground block uppercase text-[10px]">
                  Required Delivery Date
                </span>
                <span className="font-semibold text-foreground">{requisition.requiredDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Justification */}
          <Card className="shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold">Justification Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs italic text-foreground bg-muted/10">
              {requisition.notes || 'No notes recorded.'}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

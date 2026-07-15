'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
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
  Printer,
  CheckCircle,
  XCircle,
  Truck,
  ArrowRight,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  useTransferDetails,
  useApproveTransfer,
  useRejectTransfer,
  useCompleteTransfer,
} from '@/hooks/use-operations';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ApprovalBadge } from '@/components/operations/approval-badge';
import { toast } from 'sonner';

export default function TransferDetailsPage() {
  const params = useParams();
  const id = params['id'] as string;

  const { data: transfer, isLoading, error, refetch } = useTransferDetails(id);

  const approveMutation = useApproveTransfer();
  const rejectMutation = useRejectTransfer();
  const completeMutation = useCompleteTransfer();

  const handlePrintSlip = () => {
    toast.info('Printing dispatch transfer slip (UI Only)...');
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

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(id);
      void refetch();
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
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="md:col-span-2 h-96 w-full rounded-xl" />
            <Skeleton className="h-60 w-full rounded-xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !transfer) {
    return (
      <PageContainer>
        <div className="text-center py-16 bg-card border rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">Transfer Record Not Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The requested stock transfer record does not exist or you lack sufficient access.
          </p>
          <Link href="/inventory/transfers" className="inline-block mt-4">
            <Button size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Transfers
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isPending = transfer.status === 'PENDING';
  const isApproved = transfer.status === 'APPROVED';

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/inventory/transfers">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Directory
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Transfer: ${transfer.id.slice(0, 8).toUpperCase()}`}
        description={`Stock transfer route created on ${new Date(transfer.createdAt).toLocaleString()}`}
        actions={
          <Button variant="outline" size="sm" onClick={handlePrintSlip} className="gap-1.5">
            <Printer className="w-4 h-4" /> Print Transfer Slip
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3 text-sm">
        {/* Left item grid list */}
        <Card className="md:col-span-2 shadow-sm border-border bg-card">
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Transfer Items List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                  <th className="p-3 pl-6">Product Item</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3 text-right pr-6">Transfer Quantity</th>
                </tr>
              </thead>
              <tbody>
                {transfer.items?.map((item) => (
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
                    <td className="p-3 text-right pr-6 font-mono font-bold text-foreground">
                      {Number(item.quantity).toFixed(2)} {item.product?.unit?.name || 'Units'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Right side options / actions */}
        <div className="space-y-6">
          {/* Status and Action Buttons */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" /> Status & Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">
                  Current Status
                </span>
                <div className="mt-1">
                  <ApprovalBadge status={transfer.status} />
                </div>
              </div>

              {isPending && (
                <div className="space-y-2 border-t pt-4">
                  <span className="text-xs text-muted-foreground font-semibold block">
                    Approval Controls
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      disabled={rejectMutation.isPending || approveMutation.isPending}
                      className="text-rose-500 hover:bg-rose-500/5 hover:text-rose-600 gap-1.5"
                    >
                      {rejectMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              )}

              {isApproved && (
                <div className="space-y-2 border-t pt-4">
                  <span className="text-xs text-muted-foreground font-semibold block">
                    Transit Controls
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
                    Mark Completed (Receive Items)
                  </Button>
                </div>
              )}

              {transfer.status === 'COMPLETED' && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg flex items-start gap-2 mt-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-500">Transfer Completed</p>
                    <p className="text-muted-foreground mt-0.5">
                      All products successfully dispatched, received, and warehouse stock balances
                      adjusted.
                    </p>
                  </div>
                </div>
              )}

              {transfer.status === 'REJECTED' && (
                <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg flex items-start gap-2 mt-2">
                  <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-rose-500">Transfer Rejected</p>
                    <p className="text-muted-foreground mt-0.5">
                      This request has been denied. No stock movements have occurred.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Route details */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-500" /> Transit Route
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-border/40">
                <div className="text-center flex-1">
                  <span className="text-[10px] text-muted-foreground uppercase block mb-1">
                    Source Depot
                  </span>
                  <span className="font-semibold text-foreground">
                    {transfer.fromWarehouse?.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {transfer.fromWarehouse?.code}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground mx-2 shrink-0" />
                <div className="text-center flex-1">
                  <span className="text-[10px] text-muted-foreground uppercase block mb-1">
                    Destination Depot
                  </span>
                  <span className="font-semibold text-foreground">
                    {transfer.toWarehouse?.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {transfer.toWarehouse?.code}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground block uppercase">
                  Transit Notes / Remarks
                </span>
                <p className="text-xs text-foreground bg-muted/20 border p-3 rounded-lg mt-1 italic whitespace-pre-wrap">
                  {transfer.remarks || 'No remarks recorded.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Audit trail */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-500" /> Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-3">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase">
                  Requested By (ID)
                </span>
                <span className="font-semibold text-foreground font-mono">
                  {transfer.createdBy}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase">
                  Approved By (ID)
                </span>
                <span className="font-semibold text-foreground font-mono">
                  {transfer.approvedBy || '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

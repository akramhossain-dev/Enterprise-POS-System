'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit2,
  FileText,
  DollarSign,
  Loader2,
  FileWarning,
  BadgeAlert,
  Building2,
  Warehouse,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/purchase/status-badge';
import { ReasonBadge } from '@/components/purchase/reason-badge';
import { ReturnsApprovalTimeline } from '@/components/purchase/returns-approval-timeline';
import { ReturnSummaryCard } from '@/components/purchase/return-summary-card';
import { ReturnFinancialSummary } from '@/components/purchase/return-financial-summary';
import { CreditNoteCard } from '@/components/purchase/credit-note-card';
import { DebitNoteCard } from '@/components/purchase/debit-note-card';
import {
  usePurchaseReturnDetails,
  useSubmitPurchaseReturn,
  useApprovePurchaseReturn,
  useRejectPurchaseReturn,
  useCancelPurchaseReturn,
  useCompletePurchaseReturn,
  useSupplierCreditNotes,
  useCreateSupplierCreditNote,
  useSupplierDebitNotes,
  useCreateSupplierDebitNote,
} from '@/hooks/use-purchase-return';
import { toast } from 'sonner';

export default function PurchaseReturnDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Queries
  const { data: purchaseReturn, isLoading, refetch } = usePurchaseReturnDetails(id);
  const { data: creditResponse } = useSupplierCreditNotes({ page: 1, limit: 50 });
  const { data: debitResponse } = useSupplierDebitNotes({ page: 1, limit: 50 });

  // Mutations
  const submitMutation = useSubmitPurchaseReturn();
  const approveMutation = useApprovePurchaseReturn();
  const rejectMutation = useRejectPurchaseReturn();
  const cancelMutation = useCancelPurchaseReturn();
  const completeMutation = useCompletePurchaseReturn();
  const createCreditNoteMutation = useCreateSupplierCreditNote();
  const createDebitNoteMutation = useCreateSupplierDebitNote();

  // Find linked documents
  const linkedCreditNote = React.useMemo(() => {
    return creditResponse?.data.find((c) => c.referenceReturnId === id);
  }, [creditResponse, id]);

  const linkedDebitNote = React.useMemo(() => {
    return debitResponse?.data.find((d) => d.referenceReturnId === id);
  }, [debitResponse, id]);

  if (isLoading || !purchaseReturn) {
    return (
      <PageContainer>
        <div className="flex h-[400px] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading return claim details...
          </p>
        </div>
      </PageContainer>
    );
  }

  // Workflows
  const handleSubmitReturn = async () => {
    try {
      await submitMutation.mutateAsync(id);
      void refetch();
    } catch {
      toast.error('Failed to submit return.');
    }
  };

  const handleApproveReturn = async () => {
    try {
      await approveMutation.mutateAsync({ id, notes: 'Approved for warehouse shipping.' });
      void refetch();
    } catch {
      toast.error('Failed to approve return.');
    }
  };

  const handleRejectReturn = async () => {
    try {
      await rejectMutation.mutateAsync({ id, notes: 'Discrepancy validation failed.' });
      void refetch();
    } catch {
      toast.error('Failed to reject return.');
    }
  };

  const handleCancelReturn = async () => {
    try {
      await cancelMutation.mutateAsync(id);
      void refetch();
    } catch {
      toast.error('Failed to cancel return.');
    }
  };

  const handleCompleteReturn = async () => {
    try {
      await completeMutation.mutateAsync(id);
      void refetch();
    } catch {
      toast.error('Failed to complete return.');
    }
  };

  // Financial document generators
  const handleGenerateCreditNote = async () => {
    try {
      await createCreditNoteMutation.mutateAsync({
        creditNoteNumber: `CN-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
        supplierId: purchaseReturn.supplierId,
        supplier: purchaseReturn.supplier as any,
        referenceReturnId: purchaseReturn.id,
        referenceReturnNumber: purchaseReturn.returnNumber,
        creditAmount: purchaseReturn.grandTotal,
        status: 'ISSUED',
        issueDate: new Date().toISOString().split('T')[0],
      });
      void refetch();
    } catch {
      toast.error('Failed to generate Credit Note.');
    }
  };

  const handleGenerateDebitNote = async () => {
    try {
      await createDebitNoteMutation.mutateAsync({
        debitNoteNumber: `DN-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
        supplierId: purchaseReturn.supplierId,
        supplier: purchaseReturn.supplier as any,
        referenceReturnId: purchaseReturn.id,
        referenceReturnNumber: purchaseReturn.returnNumber,
        amount: purchaseReturn.grandTotal,
        status: 'ISSUED',
        issueDate: new Date().toISOString().split('T')[0],
      });
      void refetch();
    } catch {
      toast.error('Failed to generate Debit Note.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageContainer className="print:p-0 print:m-0 print:border-none print:shadow-none bg-background">
      {/* Detail header */}
      <PageHeader
        title={`Purchase Return Claims Details`}
        description={`Audit logistics returns, confirm credit notes, adjust settlement claims and check timelines.`}
        actions={
          <div className="flex gap-2 print:hidden">
            <Link href="/purchase/returns">
              <Button variant="outline" size="sm" className="gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
              <Printer className="w-4 h-4" /> Print Claim
            </Button>
            {purchaseReturn.status === 'DRAFT' && (
              <Link href={`/purchase/returns/${id}/edit`}>
                <Button size="sm" className="gap-1">
                  <Edit2 className="w-4 h-4" /> Edit Claim
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        {/* Document Status Ribbon */}
        <div className="border border-border/80 bg-card rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Voucher ID:
              </span>
              <span className="font-mono font-bold text-foreground">
                {purchaseReturn.returnNumber}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              Created on {new Date(purchaseReturn.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Workflow Stage:</span>
              <StatusBadge status={purchaseReturn.status} />
            </div>
          </div>
        </div>

        {/* Reusable Return Details Block */}
        <ReturnSummaryCard purchaseReturn={purchaseReturn} />

        {/* Returned items lists */}
        <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden text-sm">
          <CardHeader className="bg-muted/20 border-b p-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
              Returned Products Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                    <th className="p-3 pl-6">Product</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3 text-right">Ordered Qty</th>
                    <th className="p-3 text-right">Received Qty</th>
                    <th className="p-3 text-right">Return Qty</th>
                    <th className="p-3 text-right">Accepted Qty</th>
                    <th className="p-3 text-right">Rejected Qty</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseReturn.items.map((it) => (
                    <tr
                      key={it.id}
                      className="border-b last:border-0 border-border bg-card hover:bg-muted/10"
                    >
                      <td className="p-3 pl-6 font-semibold text-foreground">{it.productName}</td>
                      <td className="p-3 font-mono text-muted-foreground">{it.sku}</td>
                      <td className="p-3 text-right font-mono">{it.orderedQty || '—'}</td>
                      <td className="p-3 text-right font-mono">{it.receivedQty || '—'}</td>
                      <td className="p-3 text-right font-mono font-bold text-foreground">
                        {it.returnQty}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-500 font-bold">
                        {it.acceptedQty}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-500 font-bold">
                        {it.rejectedQty}
                      </td>
                      <td className="p-3">
                        <ReasonBadge reason={it.reason} />
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary">
                          {it.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Settlement and Workflow timeline panels */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Timeline */}
          <div className="md:col-span-2 space-y-6">
            <ReturnsApprovalTimeline
              status={purchaseReturn.status}
              timeline={purchaseReturn.approvalTimeline}
            />

            {/* Linked Documents Display */}
            {(linkedCreditNote || linkedDebitNote) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                  Settled Financial Documents
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {linkedCreditNote && <CreditNoteCard creditNote={linkedCreditNote} />}
                  {linkedDebitNote && <DebitNoteCard debitNote={linkedDebitNote} />}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Financial Summary */}
            <ReturnFinancialSummary purchaseReturn={purchaseReturn} />

            {/* Workflow Approval Panel (Admin Action Panel) */}
            <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden print:hidden text-sm">
              <CardHeader className="bg-muted/20 border-b p-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Claims Control Room
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {purchaseReturn.status === 'DRAFT' && (
                  <Button
                    className="w-full font-semibold"
                    onClick={handleSubmitReturn}
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Submit Return Claim
                  </Button>
                )}

                {purchaseReturn.status === 'PENDING' && (
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold gap-1"
                      onClick={handleApproveReturn}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4" /> Approve Claim
                    </Button>
                    <Button
                      className="w-full bg-rose-600 hover:bg-rose-700 font-semibold gap-1"
                      onClick={handleRejectReturn}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="w-4 h-4" /> Reject Claim
                    </Button>
                  </div>
                )}

                {purchaseReturn.status === 'APPROVED' && (
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold"
                      onClick={handleCompleteReturn}
                      disabled={completeMutation.isPending}
                    >
                      {completeMutation.isPending && (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      )}
                      Mark Return Completed
                    </Button>
                    <Button
                      className="w-full font-semibold"
                      variant="outline"
                      onClick={handleCancelReturn}
                      disabled={cancelMutation.isPending}
                    >
                      Cancel Return Request
                    </Button>
                  </div>
                )}

                {purchaseReturn.status === 'COMPLETED' && (
                  <div className="space-y-2.5">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs flex gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <div>
                        <p className="font-bold">Claim Finalized</p>
                        <p className="mt-0.5 leading-relaxed text-[10px]">
                          Return is completed. Assets inventory and supplier ledgers have been
                          updated.
                        </p>
                      </div>
                    </div>

                    {purchaseReturn.returnMethod === 'CREDIT_NOTE' && !linkedCreditNote && (
                      <Button
                        className="w-full font-semibold bg-emerald-600 hover:bg-emerald-700 gap-1"
                        onClick={handleGenerateCreditNote}
                        disabled={createCreditNoteMutation.isPending}
                      >
                        <FileText className="w-4 h-4" /> Generate Credit Note
                      </Button>
                    )}

                    {purchaseReturn.returnMethod === 'REFUND' && !linkedDebitNote && (
                      <Button
                        className="w-full font-semibold bg-amber-600 hover:bg-amber-700 gap-1"
                        onClick={handleGenerateDebitNote}
                        disabled={createDebitNoteMutation.isPending}
                      >
                        <FileWarning className="w-4 h-4" /> Generate Debit Note
                      </Button>
                    )}
                  </div>
                )}

                {purchaseReturn.status === 'REJECTED' && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs flex gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="font-bold">Claim Denied</p>
                      <p className="mt-0.5 leading-relaxed text-[10px]">
                        This return voucher has been rejected. Submit manual corrections if
                        necessary.
                      </p>
                    </div>
                  </div>
                )}

                {purchaseReturn.status === 'CANCELLED' && (
                  <div className="p-3 bg-muted text-muted-foreground rounded-xl text-xs flex gap-2 border">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="font-bold">Voucher Cancelled</p>
                      <p className="mt-0.5 leading-relaxed text-[10px]">
                        This return claim is aborted and archived.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

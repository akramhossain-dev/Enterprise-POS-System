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
  ClipboardList,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  FileCheck,
  Plus,
  Loader2,
  ListFilter,
  DollarSign,
  Upload,
} from 'lucide-react';
import {
  useStockTakeDetails,
  usePopulateStockTake,
  useUpdateStockTakeItem,
  useBulkAddStockTakeItems,
  useStartStockTake,
  useCompleteStockTake,
  useCancelStockTake,
  useCreateReconciliation,
  useApproveReconciliation,
  useRejectReconciliation,
} from '@/hooks/use-operations';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ApprovalBadge } from '@/components/operations/approval-badge';
import { DifferenceIndicator } from '@/components/operations/difference-indicator';
import { toast } from 'sonner';

export default function CycleCountDetailsPage() {
  const params = useParams();
  const id = params['id'] as string;

  const { data: stockTake, isLoading, error, refetch } = useStockTakeDetails(id);

  const populateMutation = usePopulateStockTake();
  const startMutation = useStartStockTake();
  const completeMutation = useCompleteStockTake();
  const cancelMutation = useCancelStockTake();
  const updateItemMutation = useUpdateStockTakeItem();
  const bulkItemsMutation = useBulkAddStockTakeItems();

  const createReconMutation = useCreateReconciliation();
  const approveReconMutation = useApproveReconciliation();
  const rejectReconMutation = useRejectReconciliation();

  // Local state for inline item editing
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const [editQty, setEditQty] = React.useState<string>('');

  // Local state for bulk counts text input
  const [showBulkUpload, setShowBulkUpload] = React.useState(false);
  const [bulkText, setBulkText] = React.useState('');

  // Local state for reconciliation notes
  const [reconNotes, setReconNotes] = React.useState('');

  const handlePopulate = async () => {
    try {
      await populateMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  const handleStart = async () => {
    try {
      await startMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  const handleCancel = async () => {
    if (
      window.confirm(
        'Are you sure you want to cancel this cycle count session? This action cannot be undone.',
      )
    ) {
      try {
        await cancelMutation.mutateAsync(id);
        void refetch();
      } catch {}
    }
  };

  const handleSaveItemQty = async (productId: string) => {
    const qtyNum = Number(editQty);
    if (isNaN(qtyNum) || qtyNum < 0) {
      toast.error('Please enter a valid non-negative physical count quantity.');
      return;
    }

    try {
      await updateItemMutation.mutateAsync({
        id,
        payload: {
          productId,
          physicalQuantity: qtyNum,
        },
      });
      setEditingItemId(null);
      void refetch();
    } catch {}
  };

  const handleBulkUploadSubmit = async () => {
    if (!bulkText.trim()) {
      toast.warning('Please enter some text input counts to upload.');
      return;
    }

    // Parse SKU, Qty lines
    const lines = bulkText.split('\n');
    const itemsToUpload: Array<{ productId: string; physicalQuantity: number }> = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.split(',');
      const pId = parts[0]?.trim();
      const qVal = parts[1]?.trim();
      if (!pId || !qVal) continue;

      const qty = Number(qVal);
      if (!isNaN(qty) && qty >= 0) {
        itemsToUpload.push({ productId: pId, physicalQuantity: qty });
      }
    }

    if (itemsToUpload.length === 0) {
      toast.error('Could not parse any valid lines. Format must be: product-uuid,quantity');
      return;
    }

    try {
      await bulkItemsMutation.mutateAsync({
        id,
        payload: { items: itemsToUpload },
      });
      setBulkText('');
      setShowBulkUpload(false);
      void refetch();
    } catch {}
  };

  const handleCreateReconciliation = async () => {
    try {
      await createReconMutation.mutateAsync({
        companyId: '11111111-1111-1111-1111-111111111111',
        stockTakeId: id,
        notes: reconNotes || undefined,
      });
      setReconNotes('');
      void refetch();
    } catch {}
  };

  const handleApproveReconciliation = async (reconId: string) => {
    try {
      await approveReconMutation.mutateAsync({
        id: reconId,
        payload: { notes: reconNotes || undefined },
      });
      setReconNotes('');
      void refetch();
    } catch {}
  };

  const handleRejectReconciliation = async (reconId: string) => {
    try {
      await rejectReconMutation.mutateAsync({
        id: reconId,
        payload: { notes: reconNotes || undefined },
      });
      setReconNotes('');
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

  if (error || !stockTake) {
    return (
      <PageContainer>
        <div className="text-center py-16 bg-card border rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">Audit Session Not Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The requested cycle count session does not exist or you lack sufficient access.
          </p>
          <Link href="/inventory/cycle-count" className="inline-block mt-4">
            <Button size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to List
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isDraft = stockTake.status === 'DRAFT';
  const isInProgress = stockTake.status === 'IN_PROGRESS';
  const isCompleted = stockTake.status === 'COMPLETED';
  const isCancelled = stockTake.status === 'CANCELLED';

  const items = stockTake.items || [];
  const reconciliation = stockTake.reconciliation;

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/inventory/cycle-count">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Sessions
          </Button>
        </Link>
      </div>

      <PageHeader
        title={stockTake.title}
        description={`Cycle count audit initiated at warehouse ${stockTake.warehouse?.name}`}
      />

      <div className="grid gap-6 md:grid-cols-3 text-sm">
        {/* Left item grid list */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Verification Sheet items</CardTitle>
                <CardDescription className="text-xs">
                  Actual physical count comparison
                </CardDescription>
              </div>

              {isInProgress && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkUpload(!showBulkUpload)}
                  className="gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> Bulk Paste Counts
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {showBulkUpload && isInProgress && (
                <div className="p-4 bg-muted/20 border-b border-border space-y-3">
                  <span className="text-xs font-semibold text-foreground block">
                    Bulk Counts Input
                  </span>
                  <Textarea
                    placeholder="product-uuid,quantity (e.g. 27d7f763-8e9a-41f2-bf89-216521a00a12,12.00)"
                    rows={4}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="font-mono text-xs bg-card border-border"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowBulkUpload(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleBulkUploadSubmit}
                      disabled={bulkItemsMutation.isPending}
                    >
                      {bulkItemsMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      )}
                      Upload Counts
                    </Button>
                  </div>
                </div>
              )}

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                    <th className="p-3 pl-6">Product Item</th>
                    <th className="p-3 text-right">System Qty (Expected)</th>
                    <th className="p-3 text-center w-36">Physical Counted</th>
                    <th className="p-3 text-right pr-6">Variance Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-muted-foreground italic">
                        {isDraft
                          ? 'This session contains no items yet. Populate stock lists using the right sidebar panel.'
                          : 'No items registered in this audit session.'}
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const isEditing = editingItemId === item.id;
                      return (
                        <tr
                          key={item.id}
                          className="border-b last:border-b-0 border-border bg-card hover:bg-muted/10"
                        >
                          <td className="p-3 pl-6">
                            <div className="flex flex-col font-medium">
                              <span className="font-semibold text-foreground text-sm">
                                {item.product?.name || '—'}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                SKU: {item.product?.sku || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono font-semibold text-foreground text-sm">
                            {Number(item.systemQuantity).toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            {isInProgress ? (
                              isEditing ? (
                                <div className="flex items-center gap-1 justify-center">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editQty}
                                    onChange={(e) => setEditQty(e.target.value)}
                                    className="w-20 h-8 text-center bg-card border-border font-bold text-xs"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveItemQty(item.productId)}
                                    disabled={updateItemMutation.isPending}
                                    className="h-8 w-8 p-0"
                                  >
                                    {updateItemMutation.isPending ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingItemId(item.id);
                                    setEditQty(
                                      item.physicalQuantity !== null
                                        ? String(item.physicalQuantity)
                                        : '',
                                    );
                                  }}
                                  className="w-24 h-8 rounded border border-border border-dashed font-bold hover:bg-muted/40 transition text-center inline-flex items-center justify-center text-foreground bg-muted/10 text-xs"
                                >
                                  {item.physicalQuantity !== null
                                    ? Number(item.physicalQuantity).toFixed(2)
                                    : 'Enter Count'}
                                </button>
                              )
                            ) : (
                              <span className="font-mono font-bold text-foreground text-sm">
                                {item.physicalQuantity !== null
                                  ? Number(item.physicalQuantity).toFixed(2)
                                  : 'Not counted'}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right pr-6">
                            <DifferenceIndicator
                              systemQuantity={Number(item.systemQuantity)}
                              physicalQuantity={
                                item.physicalQuantity !== null
                                  ? Number(item.physicalQuantity)
                                  : null
                              }
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Reconciliation flow card */}
          {isCompleted && (
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-primary">
                  <FileCheck className="w-5 h-5 text-primary" /> Stock Reconciliation Workflow
                </CardTitle>
                <CardDescription className="text-xs">
                  Generate reconciliation reports for variance discrepancies, and apply corrections
                  to live stock balances.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {!reconciliation ? (
                  <div className="space-y-4">
                    <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Physical audits are locked. Please generate a stock reconciliation file to
                        submit variance adjustments for approval.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                        Reconciliation Notes & Comments
                      </label>
                      <Textarea
                        placeholder="Explain variance findings, reasons for corrections, auditing annotations..."
                        value={reconNotes}
                        onChange={(e) => setReconNotes(e.target.value)}
                        className="bg-muted/10 border-border"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleCreateReconciliation}
                      disabled={createReconMutation.isPending}
                      className="gap-1.5"
                    >
                      {createReconMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileCheck className="w-4 h-4" />
                      )}
                      Generate Reconciliation File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 justify-between border-b pb-3 border-border/40">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase block">
                          Reconciliation Status
                        </span>
                        <div className="mt-1">
                          <ApprovalBadge status={reconciliation.status} />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase block font-mono">
                          File ID
                        </span>
                        <span className="font-mono text-xs font-semibold block mt-1 bg-muted px-1.5 py-0.5 rounded text-foreground">
                          {reconciliation.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {reconciliation.notes && (
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase block">
                          Auditor Notes
                        </span>
                        <p className="text-xs text-foreground bg-muted/20 border p-3 rounded-lg mt-1 italic">
                          {reconciliation.notes}
                        </p>
                      </div>
                    )}

                    {reconciliation.status === 'PENDING' && (
                      <div className="space-y-3 pt-3 border-t">
                        <span className="text-xs font-semibold text-muted-foreground block">
                          Approvals Panel
                        </span>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground block">
                            Reconciler Remarks (Optional)
                          </label>
                          <Textarea
                            placeholder="Add approval remarks or reject reasons..."
                            value={reconNotes}
                            onChange={(e) => setReconNotes(e.target.value)}
                            className="bg-muted/10 border-border"
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => handleRejectReconciliation(reconciliation.id)}
                            disabled={
                              rejectReconMutation.isPending || approveReconMutation.isPending
                            }
                            className="text-rose-500 hover:bg-rose-500/5 hover:text-rose-600 gap-1"
                          >
                            {rejectReconMutation.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            Reject Adjustments
                          </Button>
                          <Button
                            onClick={() => handleApproveReconciliation(reconciliation.id)}
                            disabled={
                              approveReconMutation.isPending || rejectReconMutation.isPending
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            {approveReconMutation.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                            Approve & Apply Stock Adjustments
                          </Button>
                        </div>
                      </div>
                    )}

                    {reconciliation.status === 'APPROVED' && (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg flex items-start gap-2 mt-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <p className="font-semibold text-emerald-500">
                            Reconciliation Approved & Applied
                          </p>
                          <p className="text-muted-foreground mt-0.5">
                            Variances have been reconciled and applied as stock movements. Warehouse
                            balances are updated.
                          </p>
                        </div>
                      </div>
                    )}

                    {reconciliation.status === 'REJECTED' && (
                      <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg flex items-start gap-2 mt-2">
                        <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <p className="font-semibold text-rose-500">Reconciliation Rejected</p>
                          <p className="text-muted-foreground mt-0.5">
                            Reconciliation has been rejected. Stock levels remain unmodified.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right side stats panel */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-primary" /> Session Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <span className="text-muted-foreground block uppercase text-[10px]">
                  Session Status
                </span>
                <div className="mt-1">
                  <ApprovalBadge status={stockTake.status} />
                </div>
              </div>

              {isDraft && (
                <div className="space-y-2 border-t pt-4">
                  <span className="text-xs text-muted-foreground font-semibold block">
                    Session Setup
                  </span>
                  <Button
                    onClick={handlePopulate}
                    disabled={populateMutation.isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                  >
                    {populateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Populate Stock List
                  </Button>
                  <Button
                    onClick={handleStart}
                    disabled={startMutation.isPending || items.length === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  >
                    {startMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Start Session
                  </Button>
                </div>
              )}

              {isInProgress && (
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
                    Complete Count Session
                  </Button>
                  <Button
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    variant="outline"
                    className="w-full text-rose-500 hover:bg-rose-500/5 hover:text-rose-600 gap-1.5"
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Cancel Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warehouse details */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <WarehouseIcon className="w-4 h-4 text-indigo-500" /> Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <span className="text-muted-foreground block uppercase text-[10px]">
                  Depot Facility
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {stockTake.warehouse?.name}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block uppercase text-[10px]">
                  Depot Code
                </span>
                <span className="font-semibold text-foreground font-mono">
                  {stockTake.warehouse?.code}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Audit trail */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-500" /> Counter Operator
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-3">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Assigned Counter ID
                </span>
                <span className="font-semibold text-foreground font-mono block mt-0.5">
                  {stockTake.conductedBy || 'No counter assigned'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Creator ID
                </span>
                <span className="font-semibold text-foreground font-mono block mt-0.5">
                  {stockTake.createdBy}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

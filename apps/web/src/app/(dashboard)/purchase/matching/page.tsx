'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Scale,
  Building2,
  FileText,
  AlertOctagon,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useGRNs, useGRNDetails } from '@/hooks/use-goods-receive';
import { invoiceMatchingService } from '@/services/invoice-matching.service';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReceivingSummaryCard } from '@/components/receive/receiving-summary-card';
import { VarianceBadge } from '@/components/receive/variance-badge';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export default function InvoiceMatchingPage() {
  const searchParams = useSearchParams();
  const goodsReceiveId = searchParams.get('goodsReceiveId');

  const [selectedGrnId, setSelectedGrnId] = React.useState<string>('');

  // Load completed receives that have invoices registered
  const {
    data: grnResponse,
    isLoading: isLoadingGRNs,
    refetch: refetchGRNs,
    isFetching: isFetchingGRNs,
  } = useGRNs({
    page: 1,
    limit: 100,
    status: 'COMPLETED',
  });

  const grns = grnResponse?.data || [];

  // Filter client-side to only show GRNs that have an invoice registered for matching!
  const invoicedGRNs = React.useMemo(() => {
    return grns.filter((g) => g.invoice);
  }, [grns]);

  // Load detailed GRN once selected
  const targetId = selectedGrnId || goodsReceiveId || '';
  const {
    data: grn,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
    isFetching: isFetchingDetails,
  } = useGRNDetails(targetId);

  // Sync selected GRN state from query param
  React.useEffect(() => {
    if (goodsReceiveId) {
      setSelectedGrnId(goodsReceiveId);
    }
  }, [goodsReceiveId]);

  // Compute 3-way matching result
  const matchResult = React.useMemo(() => {
    if (!grn) return null;
    return invoiceMatchingService.compute3WayMatch(grn);
  }, [grn]);

  const handleRefetchAll = () => {
    void refetchGRNs();
    if (targetId) void refetchDetails();
  };

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/purchase">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            &larr; Back to Dashboard
          </Button>
        </Link>
      </div>

      <PageHeader
        title="3-Way Invoice Matching Audit"
        description="Reconcile Purchase Order commitments (PO) against actual physical warehouse cargo intakes (GRN) and vendor billings (Invoice) to verify discrepancy records."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefetchAll}
            disabled={isFetchingGRNs || isFetchingDetails}
          >
            <RefreshCw
              className={cn('w-4 h-4', (isFetchingGRNs || isFetchingDetails) && 'animate-spin')}
            />
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3 text-sm">
        {/* Left main comparison grid */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border bg-cardard">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary animate-pulse" /> Reconciled Item Ledger
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Dropdown selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Select Invoiced GRN
                </label>
                <select
                  value={selectedGrnId}
                  onChange={(e) => setSelectedGrnId(e.target.value)}
                  className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
                >
                  <option value="">Choose an invoiced Goods Receive Note...</option>
                  {invoicedGRNs.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.grnNumber} — {g.supplier?.companyName} (${Number(g.grandTotal).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {isLoadingDetails ? (
                <div className="py-20 text-center text-muted-foreground">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                  <span>Loading reconciliation metrics...</span>
                </div>
              ) : matchResult ? (
                /* Item ledger matching grid */
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                        <th className="p-3 pl-6">Product Item</th>
                        <th className="p-3 text-center">PO Qty</th>
                        <th className="p-3 text-center">GRN Qty</th>
                        <th className="p-3 text-center">Invoice Qty</th>
                        <th className="p-3 text-right">Qty Var.</th>
                        <th className="p-3 text-right">Price Var.</th>
                        <th className="p-3 text-center pr-6">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchResult.items.map((item) => (
                        <tr
                          key={item.productId}
                          className="border-b last:border-b-0 border-border bg-cardard hover:bg-muted/10"
                        >
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
                            {item.poQty}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-foreground">
                            {item.grnQty}
                          </td>
                          <td className="p-3 text-center font-mono font-semibold text-muted-foreground">
                            {item.invoiceQty}
                          </td>
                          <td className="p-3 text-right font-mono">
                            <VarianceBadge value={item.qtyVariance} type="quantity" />
                          </td>
                          <td className="p-3 text-right font-mono">
                            <VarianceBadge value={item.priceVariance} type="price" />
                          </td>
                          <td className="p-3 text-center pr-6">
                            {item.hasException ? (
                              <span className="text-rose-500 font-bold text-[10px] uppercase flex items-center justify-center gap-1">
                                <AlertOctagon className="w-3.5 h-3.5" /> Exception
                              </span>
                            ) : (
                              <span className="text-emerald-500 font-bold text-[10px] uppercase flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Ok
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center text-muted-foreground italic bg-muted/10 rounded-xl">
                  Choose a completed receiving log from the select box above to run matching checks.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side stats */}
        <div className="space-y-6">
          {matchResult && (
            <>
              {/* Matching summary metrics */}
              <ReceivingSummaryCard matchingResult={matchResult} />

              {/* Document References metadata */}
              <Card className="shadow-sm border-border bg-cardard">
                <CardHeader className="border-b">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-500" /> Linked Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Purchase order */}
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                      Purchase Order Reference
                    </span>
                    {matchResult.purchaseOrderId ? (
                      <Link
                        href={`/purchase/orders/${matchResult.purchaseOrderId}`}
                        className="font-mono font-bold text-primary hover:underline text-xs mt-1 block"
                      >
                        {matchResult.purchaseOrderNumber}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </div>

                  {/* Goods Receive */}
                  <div className="border-t pt-3">
                    <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                      Goods Receive Note (GRN)
                    </span>
                    <Link
                      href={`/purchase/receive/${matchResult.goodsReceiveId}`}
                      className="font-mono font-bold text-primary hover:underline text-xs mt-1 block"
                    >
                      {matchResult.grnNumber}
                    </Link>
                  </div>

                  {/* Supplier Invoice */}
                  <div className="border-t pt-3">
                    <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                      Supplier Invoice Reference
                    </span>
                    {matchResult.supplierInvoiceId ? (
                      <Link
                        href={`/purchase/invoices/${matchResult.supplierInvoiceId}`}
                        className="font-mono font-bold text-primary hover:underline text-xs mt-1 block"
                      >
                        {matchResult.supplierInvoiceNumber}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

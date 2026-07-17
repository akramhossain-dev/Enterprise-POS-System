'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useReturnDetails, useApproveReturn } from '@/hooks/use-sales-return';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApprovalTimeline } from '@/components/pos/approval-timeline';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

interface Params {
  id: string;
}

export default function ReturnDetailsPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const { data: claim, isLoading, isError } = useReturnDetails(id);
  const approveMutation = useApproveReturn();

  const handleApprove = () => {
    approveMutation.mutate(id);
  };

  return (
    <PageContainer className="max-w-4xl mx-auto py-6 text-foreground select-none text-left">
      {/* Back navigation */}
      <div className="mb-4">
        <Link href="/pos/returns">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Returns Claims</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Return Claim Details"
        description="Verify returned products specifications, defects, and supervisor validations."
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-xs">Loading return claim details...</p>
        </div>
      ) : isError || !claim ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl text-rose-400 text-xs">
          Failed to load return claim details.
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {/* Progress Timeline */}
          <ApprovalTimeline status={claim.status} refundStatus={claim.refundStatus} />

          {/* Details columns */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Items */}
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-card border-border text-foreground">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-sm font-bold text-muted-foreground">
                    Returned Goods
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px] bg-muted/20">
                        <th className="py-2.5 px-4">Item details</th>
                        <th className="py-2.5 px-3 text-center">Returned Qty</th>
                        <th className="py-2.5 px-3">Condition</th>
                        <th className="py-2.5 px-4 text-right">Credit Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-medium text-foreground font-mono">
                      {claim.items.map((it: any, idx: number) => (
                        <tr key={idx} className="hover:bg-muted/10 font-mono">
                          <td className="py-3 px-4 font-sans font-bold text-foreground">
                            <p>{it.productName}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              Reason: {it.reason}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-center">{it.quantityReturned}</td>
                          <td className="py-3 px-3">
                            <Badge className="bg-accent border-border text-foreground text-[9px] uppercase">
                              {it.condition}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-rose-455">
                            ${(it.quantityReturned * it.unitPrice).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* Refund options panel */}
            <div className="md:col-span-1 space-y-6">
              <Card className="bg-card border-border text-foreground">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-sm font-bold text-muted-foreground">
                    Claim Valuation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4 text-xs font-mono text-left">
                  <div className="space-y-1.5 border-b border-border pb-3 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span className="font-sans font-bold text-foreground">
                        {claim.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Invoice ref:</span>
                      <span>{claim.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refund Mode:</span>
                      <span className="font-bold text-foreground">{claim.refundMethod}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Goods subtotal:</span>
                      <span>${claim.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax adjust:</span>
                      <span>+${claim.taxAdjustments.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-rose-400 pt-2 border-t border-border">
                      <span>Refund Due:</span>
                      <span>${claim.refundAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {claim.notes && (
                    <div className="bg-muted/40 p-2.5 border border-border rounded-lg text-muted-foreground font-sans text-[11px] leading-normal">
                      <span className="font-bold block text-foreground mb-0.5">Notes:</span>
                      {claim.notes}
                    </div>
                  )}

                  {claim.status === 'SUBMITTED' && (
                    <Button
                      onClick={handleApprove}
                      disabled={approveMutation.isPending}
                      className="w-full h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-[10px] tracking-wider gap-1 mt-2"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve & Refund Cash
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

'use client';

import * as React from 'react';
import type { InvoiceMatchingResult } from '@/types/goods-receive';
import { ShieldCheck, ShieldAlert, ArrowRight, DollarSign, Scale } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ReceivingSummaryCardProps {
  matchingResult: InvoiceMatchingResult;
  className?: string;
}

export function ReceivingSummaryCard({ matchingResult, className }: ReceivingSummaryCardProps) {
  const { isMatched, discrepancyCount, varianceSummary } = matchingResult;

  return (
    <div className={cn('bg-cardard border rounded-xl p-5 shadow-sm space-y-4 text-sm', className)}>
      <h3 className="font-semibold text-sm border-b pb-2 text-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Scale className="w-4 h-4 text-primary" /> 3-Way Match Verification
      </h3>

      {isMatched ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <h4 className="font-bold text-sm">3-Way Match Succeeded</h4>
            <p className="text-muted-foreground">
              Quantities ordered match quantities physically received, and invoiced unit costs align
              with PO rates.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm">Reconciliation Mismatch Flagged</h4>
            <p className="text-muted-foreground">
              We identified <strong>{discrepancyCount}</strong> asset discrepancies between the PO,
              GRN, and Supplier Invoice records.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3 text-xs font-semibold text-muted-foreground pt-1">
        {/* Quantity Variance */}
        <div className="border rounded-lg p-3 bg-muted/20">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
            Qty Variance Total
          </span>
          <span className="font-mono text-base text-foreground font-bold">
            {varianceSummary.qtyVarianceTotal} units
          </span>
        </div>

        {/* Price Variance */}
        <div className="border rounded-lg p-3 bg-muted/20">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
            Price Variance Total
          </span>
          <span className="font-mono text-base text-foreground font-bold">
            ${varianceSummary.priceVarianceTotal.toFixed(2)} / unit
          </span>
        </div>

        {/* Discrepancy Amount */}
        <div className="border rounded-lg p-3 bg-muted/20">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
            Variance Valuation
          </span>
          <span className="font-mono text-base text-rose-500 font-bold flex items-center">
            <DollarSign className="w-4 h-4 shrink-0" />
            {varianceSummary.totalDiscrepancyAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

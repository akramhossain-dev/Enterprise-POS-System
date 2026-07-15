'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, Wallet } from 'lucide-react';
import type { PurchaseReturn } from '@/types/purchase-return';

interface ReturnFinancialSummaryProps {
  purchaseReturn: PurchaseReturn;
}

export function ReturnFinancialSummary({ purchaseReturn }: ReturnFinancialSummaryProps) {
  const methodLabels = {
    CREDIT_NOTE: 'Supplier Credit Note',
    REFUND: 'Refund Credit / Cash Adjustment',
    REPLACEMENT: 'Inventory Replacement',
  };

  return (
    <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden text-sm">
      <CardHeader className="bg-muted/20 border-b p-4">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-500" /> Return Valuation & Settlement
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal value</span>
          <span className="font-semibold text-foreground">
            ${Number(purchaseReturn.subtotal).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Estimated Tax (+)</span>
          <span className="font-semibold text-foreground">
            ${Number(purchaseReturn.tax).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Discounts Applied (-)</span>
          <span className="font-semibold text-rose-500">
            -${Number(purchaseReturn.discount).toFixed(2)}
          </span>
        </div>

        <div className="border-t border-border/80 my-2 pt-2 flex justify-between items-baseline">
          <span className="font-bold text-foreground">Grand Total Valuation</span>
          <span className="text-xl font-bold font-mono text-emerald-500">
            ${Number(purchaseReturn.grandTotal).toFixed(2)}
          </span>
        </div>

        <div className="border-t border-border/80 pt-3 flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" /> Settlement Method:
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary uppercase">
            {methodLabels[purchaseReturn.returnMethod] || purchaseReturn.returnMethod}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

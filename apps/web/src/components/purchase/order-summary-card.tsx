'use client';

import * as React from 'react';
import { DollarSign } from 'lucide-react';

interface OrderSummaryCardProps {
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost?: number;
  otherCharges?: number;
  className?: string;
}

export function OrderSummaryCard({
  subtotal,
  discount,
  tax,
  shippingCost = 0,
  otherCharges = 0,
  className,
}: OrderSummaryCardProps) {
  const grandTotal = subtotal - discount + tax + shippingCost + otherCharges;

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-sm border-b pb-2 text-foreground uppercase tracking-wider">
        Order Financial Summary
      </h3>
      <div className="space-y-2.5 text-xs font-medium">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Requisition Subtotal</span>
          <span className="font-mono text-foreground font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order Discounts (-)</span>
          <span className="font-mono text-rose-500">-${discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax Valuation (+)</span>
          <span className="font-mono text-foreground">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping Logistics (+)</span>
          <span className="font-mono text-foreground">${shippingCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Other Surcharges (+)</span>
          <span className="font-mono text-foreground">${otherCharges.toFixed(2)}</span>
        </div>

        <div className="border-t border-dashed pt-4 flex justify-between items-center text-sm font-bold">
          <span className="text-foreground text-sm uppercase">Total Procurement Value</span>
          <span className="font-mono text-primary text-base flex items-center">
            <DollarSign className="w-4.5 h-4.5 text-primary shrink-0" />
            {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

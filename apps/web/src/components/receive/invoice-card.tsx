'use client';

import * as React from 'react';
import type { SupplierInvoice } from '@/types/goods-receive';
import { DollarSign, FileText, Calendar, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '@/components/purchase/status-badge';

interface InvoiceCardProps {
  invoice: SupplierInvoice;
  className?: string;
}

export function InvoiceCard({ invoice, className }: InvoiceCardProps) {
  const invSubtotal = Number(invoice.subtotal);
  const invTax = Number(invoice.tax);
  const invDiscount = Number(invoice.discount);
  const invTotal = Number(invoice.grandTotal);

  return (
    <div className="bg-cardard border rounded-xl p-5 shadow-sm space-y-4 text-sm">
      <div className="flex justify-between items-start border-b pb-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">
            Supplier Invoice
          </span>
          <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            {invoice.invoiceNumber}
          </span>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="space-y-2 text-xs font-semibold text-muted-foreground">
        <div className="flex justify-between">
          <span>Invoice Date</span>
          <span className="text-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(invoice.invoiceDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Supplier Partner</span>
          <span className="text-foreground">
            {invoice.supplier?.companyName || 'Unknown Supplier'}
          </span>
        </div>

        <div className="border-t border-dashed pt-3 space-y-1.5">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-mono text-foreground">${invSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount (-):</span>
            <span className="font-mono text-rose-500">-${invDiscount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (+):</span>
            <span className="font-mono text-foreground">${invTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-2.5 text-sm font-bold text-foreground">
            <span className="uppercase text-xs">Total Invoiced Amount:</span>
            <span className="text-primary font-mono flex items-center">
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              {invTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

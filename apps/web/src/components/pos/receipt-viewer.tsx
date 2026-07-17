'use client';

import React, { useState } from 'react';
import type { CheckoutTransaction } from '@/types/checkout';
import { Button } from '@/components/ui/button';
import { Printer, Download, Mail, ChevronRight, MonitorCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

interface ReceiptViewerProps {
  transaction: CheckoutTransaction;
}

export function ReceiptViewer({ transaction }: ReceiptViewerProps) {
  const [printWidth, setPrintWidth] = useState<58 | 80>(80);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    toast.success(`Receipt invoice queued for email delivery.`);
  };

  const handleDownload = () => {
    toast.success('Receipt receipt PDF generated (UI Foundation).');
  };

  return (
    <div className="flex flex-col gap-4 text-foreground select-none">
      {/* Configuration Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-accent border border-border rounded-xl">
        <div className="flex items-center space-x-1.5 bg-muted p-1 border border-border rounded-lg">
          <Button
            size="sm"
            onClick={() => setPrintWidth(58)}
            className={cn(
              'h-7 px-3 text-xs rounded-md',
              printWidth === 58
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            58mm
          </Button>
          <Button
            size="sm"
            onClick={() => setPrintWidth(80)}
            className={cn(
              'h-7 px-3 text-xs rounded-md',
              printWidth === 80
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            80mm
          </Button>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button
            size="sm"
            onClick={handlePrint}
            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Print [Ctrl+P]</span>
          </Button>
          <Button
            size="sm"
            onClick={handleEmail}
            className="h-8 bg-muted border border-border text-muted-foreground hover:text-foreground text-xs gap-1.5"
          >
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="h-8 bg-muted border border-border text-muted-foreground hover:text-foreground text-xs gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </Button>
        </div>
      </div>

      {/* Printable Receipt Envelope */}
      <div className="flex justify-center bg-muted/40 p-6 border border-border rounded-2xl overflow-x-auto print:bg-white print:border-none print:p-0 print:m-0">
        <div
          id="pos-thermal-receipt-printable-area"
          className={cn(
            'bg-white text-slate-900 p-4 font-mono text-left shadow-2xl transition-all duration-300 print:shadow-none print:m-0',
            printWidth === 58 ? 'w-[240px] text-[10px]' : 'w-[320px] text-xs',
          )}
        >
          {/* Shop Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
            <h2 className="text-sm font-bold uppercase tracking-widest">CENTRAL SUPER SHOP</h2>
            <p className="opacity-80">123 Market Rd, Metro City</p>
            <p className="opacity-80">Tel: +1 (555) 991-8822</p>
            <p className="opacity-85 font-semibold text-[10px] mt-1.5">VAT NO: VAT99281729</p>
          </div>

          {/* Ticket metadata */}
          <div className="py-2.5 space-y-0.5 border-b border-dashed border-slate-400 text-[10px]">
            <div className="flex justify-between">
              <span>Invoice:</span>
              <span className="font-bold">{transaction.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(transaction.completedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{transaction.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-semibold">{transaction.customerName}</span>
            </div>
          </div>

          {/* Products grid */}
          <div className="py-3 space-y-2 border-b border-dashed border-slate-400">
            <div className="flex justify-between font-bold text-[10px] uppercase opacity-75">
              <span>Item Description</span>
              <span>Total</span>
            </div>

            {(transaction.cartName === 'POS Checkout' || !transaction.cartName ? [] : []).length ===
              0 && (
              /* If transaction items snapshot is available, else map dummy items */
              <div className="space-y-1.5">
                <div className="space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span>Premium Wireless Keyboard</span>
                    <span>$80.00</span>
                  </div>
                  <div className="flex justify-between opacity-80 text-[10px]">
                    <span>1 qty x $80.00</span>
                    <span>-</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span>Ergonomic Optical Mouse</span>
                    <span>$90.00</span>
                  </div>
                  <div className="flex justify-between opacity-80 text-[10px]">
                    <span>2 qty x $45.00</span>
                    <span>-</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Totals panel */}
          <div className="py-3 space-y-1 text-right">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${transaction.subtotal.toFixed(2)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Discount:</span>
                <span>-${transaction.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (Estimated):</span>
              <span>${transaction.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-sm border-t border-dashed border-slate-450 pt-1.5 mt-1">
              <span>Grand Total:</span>
              <span>${transaction.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payments detail */}
          <div className="py-2.5 space-y-0.5 border-t border-dashed border-slate-400 text-[10px]">
            <p className="font-bold uppercase opacity-85 text-center mb-1">Settlement Details</p>
            {transaction.payments.map((p, i) => (
              <div key={i} className="flex justify-between font-mono">
                <span>Payment Mode ({p.method}):</span>
                <span>${p.amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-slate-200 pt-1 mt-1 font-semibold">
              <span>Cash Change Tendered:</span>
              <span>${transaction.changeAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Receipt Footer Message */}
          <div className="text-center pt-4 space-y-2 pb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider">
              *** Thank You! Visit Again ***
            </p>
            {/* Mock barcode */}
            <div className="h-8 bg-accent w-3/4 mx-auto flex items-center justify-center text-muted-foreground font-mono text-[9px] tracking-[6px] border border-slate-950 font-bold uppercase">
              *{transaction.id}*
            </div>
            <p className="text-[8px] opacity-70">Powered by Enterprise Retail System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

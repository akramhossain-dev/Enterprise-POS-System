'use client';

import React from 'react';
import type { CheckoutTransaction } from '@/types/checkout';
import { Button } from '@/components/ui/button';
import { Printer, Download, Mail, Building, Globe, MailCheck, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceViewerProps {
  transaction: CheckoutTransaction;
}

export function InvoiceViewer({ transaction }: InvoiceViewerProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success('Invoice document PDF downloaded (UI Foundation).');
  };

  const handleEmail = () => {
    toast.success('Invoice emailed to customer contact (UI Foundation).');
  };

  return (
    <div className="flex flex-col gap-4 text-slate-100 select-none">
      {/* Document Toolbar */}
      <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <h3 className="text-xs sm:text-sm font-bold text-slate-200">A4 Invoice Document Viewer</h3>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={handlePrint}
            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Print Invoice</span>
          </Button>
          <Button
            size="sm"
            onClick={handleEmail}
            className="h-8 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs gap-1.5"
          >
            <Mail className="h-4 w-4" />
            <span>Send Email</span>
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="h-8 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {/* A4 Sheet Paper */}
      <div className="flex justify-center bg-slate-950/40 p-8 border border-slate-900 rounded-2xl print:bg-white print:border-none print:p-0 print:m-0">
        <div className="w-[800px] bg-white text-slate-800 p-8 font-sans shadow-2xl flex flex-col justify-between min-h-[1050px] print:shadow-none print:p-0 print:m-0 print:w-full">
          {/* Main header block */}
          <div className="space-y-6">
            <div className="flex justify-between items-start pb-6 border-b border-slate-100">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-6 w-6 rounded bg-slate-900 flex items-center justify-center text-emerald-400 font-bold">
                    E
                  </span>
                  <h1 className="text-xl font-black text-slate-900 tracking-wider">
                    ENTERPRISE POS
                  </h1>
                </div>
                <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
                  Head Office: Central Logistics Center, Suite 402, Trade District, City Plaza.
                </p>
                <p className="text-xs text-slate-400 mt-1">VAT: VAT-99120281 | Reg: REG-99128</p>
              </div>

              <div className="text-right">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-1">
                  INVOICE
                </h2>
                <p className="text-sm font-bold text-slate-700">Ref: {transaction.invoiceNumber}</p>
                <div className="text-xs text-slate-500 mt-2.5 space-y-0.5 font-mono">
                  <p>Issue Date: {new Date(transaction.completedAt).toLocaleDateString()}</p>
                  <p>
                    Status: <span className="text-emerald-600 font-bold">PAID</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Address cards (Billed to vs Store Info) */}
            <div className="grid grid-cols-2 gap-8 py-2">
              <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1.5">
                  Billed To (Customer Details)
                </span>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  {transaction.customerName}
                </h4>
                <p className="text-xs text-slate-500">ID: {transaction.customerId}</p>
                {transaction.customerId !== 'walk-in' ? (
                  <p className="text-xs text-slate-400 mt-1">
                    Account credit utilization applied on checkout.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">
                    Retail walk-in cashier receipt checkout.
                  </p>
                )}
              </div>

              <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1.5">
                  Issued From (Store Details)
                </span>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Central Warehouse POS Register
                </h4>
                <p className="text-xs text-slate-500">Terminal ID: T-01</p>
                <p className="text-xs text-slate-400 mt-1">
                  Issued By Cashier: {transaction.cashierName}
                </p>
              </div>
            </div>

            {/* Products grid table */}
            <table className="w-full text-xs text-left border-collapse mt-4">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Discount</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-800">Premium Wireless Keyboard</p>
                    <p className="text-[10px] text-slate-400">SKU: KBD-WIRELESS-01</p>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">$80.00</td>
                  <td className="py-3 px-3 text-center">1</td>
                  <td className="py-3 px-3 text-right font-mono">$0.00</td>
                  <td className="py-3 px-3 text-right font-mono font-bold">$80.00</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-800">Ergonomic Optical Mouse</p>
                    <p className="text-[10px] text-slate-400">SKU: MSE-ERGO-02</p>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">$45.00</td>
                  <td className="py-3 px-3 text-center">2</td>
                  <td className="py-3 px-3 text-right font-mono">$0.00</td>
                  <td className="py-3 px-3 text-right font-mono font-bold">$90.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Section */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-start">
            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-sm flex-1 text-xs">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-2">
                Payment Settlement Summary
              </span>
              <div className="space-y-1 font-mono">
                {transaction.payments.map((p, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{p.method}:</span>
                    <span>${p.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-200 pt-1 mt-1 text-slate-600 font-semibold">
                  <span>Cash Change:</span>
                  <span>${transaction.changeAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="w-64 text-xs text-right space-y-2 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>${transaction.subtotal.toFixed(2)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Discount:</span>
                  <span>-${transaction.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Estimated Tax:</span>
                <span>${transaction.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
                <span>Grand Total:</span>
                <span>${transaction.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Invoice footer terms */}
          <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-6 mt-8 space-y-1">
            <p className="font-bold text-slate-500">Terms & Conditions</p>
            <p>Returns only accepted within 7 days with valid printed invoice document.</p>
            <p>Thank you for choosing Central POS shopping. We appreciate your partnership!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

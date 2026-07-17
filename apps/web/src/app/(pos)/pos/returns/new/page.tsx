'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { salesReturnService } from '@/services/sales-return.service';
import { useCreateReturn } from '@/hooks/use-sales-return';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  ArrowRightLeft,
  CreditCard,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export default function POSCreateReturnPage() {
  const router = useRouter();
  const createReturnMutation = useCreateReturn();

  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [fetchedOrder, setFetchedOrder] = useState<any | null>(null);

  // Active items being returned
  const [returnItems, setReturnItems] = useState<any[]>([]);

  // Exchange details
  const [isExchange, setIsExchange] = useState(false);
  const [exchangeItems, setExchangeItems] = useState<any[]>([]);

  // Form details
  const [refundMethod, setRefundMethod] = useState<
    'CASH' | 'CARD' | 'MOBILE' | 'STORE_CREDIT' | 'GIFT_CARD'
  >('CASH');
  const [notes, setNotes] = useState('');

  const handleFetchInvoice = async () => {
    if (!invoiceQuery.trim()) {
      toast.warning('Please enter a valid invoice reference.');
      return;
    }

    try {
      // Direct call to retrieve order detail
      const order = await salesReturnService.getOrder(invoiceQuery);
      setFetchedOrder(order);
      // Initialize return lines with zero quantity
      setReturnItems(
        order.items.map((it: any) => ({
          productId: it.productId,
          productName: it.productName,
          sku: 'SKU-' + it.productId.toUpperCase(),
          unitPrice: it.unitPrice,
          quantitySold: it.quantity,
          quantityReturned: 0,
          condition: 'NEW',
          reason: 'Customer Changed Mind',
        })),
      );
      setExchangeItems([]);
      toast.success(`Loaded items from invoice: ${order.invoiceNumber}`);
    } catch {
      toast.error('Failed to locate invoice. Check the reference code.');
      setFetchedOrder(null);
    }
  };

  const handleUpdateQty = (idx: number, qty: number) => {
    const limit = returnItems[idx].quantitySold;
    const bounded = Math.max(0, Math.min(limit, qty));
    setReturnItems(
      returnItems.map((it, i) => (i === idx ? { ...it, quantityReturned: bounded } : it)),
    );
  };

  const handleUpdateCondition = (idx: number, cond: string) => {
    setReturnItems(returnItems.map((it, i) => (i === idx ? { ...it, condition: cond } : it)));
  };

  const handleUpdateReason = (idx: number, reason: string) => {
    setReturnItems(returnItems.map((it, i) => (i === idx ? { ...it, reason: reason } : it)));
  };

  const handleAddExchangeItem = () => {
    // Mock catalog item addition
    const catalog = [
      { productId: 'ex-p1', productName: 'Ergonomic Optical Mouse', unitPrice: 45 },
      { productId: 'ex-p2', productName: 'USB-C Cable Charger', unitPrice: 25 },
      { productId: 'ex-p3', productName: 'Standard Cordless Keypad', unitPrice: 35 },
    ];
    // Select one randomly
    const choice = catalog[Math.floor(Math.random() * catalog.length)]!;
    setExchangeItems([...exchangeItems, { ...choice, quantity: 1 }]);
  };

  const handleRemoveExchangeItem = (idx: number) => {
    setExchangeItems(exchangeItems.filter((_, i) => i !== idx));
  };

  // Pricing calculations
  const totalReturnedValue = returnItems.reduce(
    (acc, it) => acc + it.quantityReturned * it.unitPrice,
    0,
  );
  const totalExchangeValue = exchangeItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);

  const priceDifference = totalExchangeValue - totalReturnedValue;

  const handleSubmit = async () => {
    if (!fetchedOrder) return;
    const activeLines = returnItems.filter((it) => it.quantityReturned > 0);
    if (activeLines.length === 0) {
      toast.error('Specify at least 1 item to return.');
      return;
    }

    const payload = {
      invoiceNumber: fetchedOrder.invoiceNumber,
      customerId: fetchedOrder.customerId,
      customerName: fetchedOrder.customerName,
      items: activeLines,
      subtotal: totalReturnedValue,
      discountAdjustments: 0,
      taxAdjustments: totalReturnedValue * 0.1,
      refundAmount: Math.max(0, -priceDifference), // Negative price difference = customer refund
      refundMethod,
      notes,
    };

    try {
      await createReturnMutation.mutateAsync(payload);
      router.push('/pos/returns');
    } catch {}
  };

  return (
    <PageContainer className="max-w-5xl mx-auto py-6 text-foreground select-none text-left">
      {/* Back link */}
      <div className="mb-4">
        <Link href="/pos/returns">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Returns</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Create Return claim"
        description="Search invoice reference codes, record product defect condition logs, and configure exchanges."
      />

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        {/* Left column form controls */}
        <div className="md:col-span-2 space-y-6">
          {/* Invoice search card */}
          <Card className="bg-card border-border text-foreground">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold text-muted-foreground">
                Retrieve Invoice Details
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Scan barcode or enter invoice key (E.g. INV-2026-07-0001, INV-2026-07-0002)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Invoice Number (INV-2026-07-0001)"
                    value={invoiceQuery}
                    onChange={(e) => setInvoiceQuery(e.target.value)}
                    className="pl-8 bg-muted border-slate-855 text-xs focus-visible:ring-emerald-500 h-9"
                  />
                </div>
                <Button
                  onClick={handleFetchInvoice}
                  className="h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 text-xs"
                >
                  Lookup Order
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sold products to return details */}
          {fetchedOrder && (
            <Card className="bg-card border-border text-foreground">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold text-muted-foreground">
                  Select Returnable Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px] bg-muted/20">
                      <th className="py-2.5 px-4">Product details</th>
                      <th className="py-2.5 px-3 text-center">Return Qty</th>
                      <th className="py-2.5 px-3">Condition</th>
                      <th className="py-2.5 px-4">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium text-foreground">
                    {returnItems.map((item, idx) => (
                      <tr key={item.productId} className="hover:bg-muted/10">
                        <td className="py-3 px-4">
                          <p className="font-bold text-foreground">{item.productName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            Bought: {item.quantitySold} x ${item.unitPrice.toFixed(2)}
                          </p>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={item.quantitySold}
                            value={item.quantityReturned || ''}
                            onChange={(e) => handleUpdateQty(idx, parseInt(e.target.value) || 0)}
                            className="bg-muted border border-border rounded px-1.5 py-1 text-center w-14 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={item.condition}
                            onChange={(e) => handleUpdateCondition(idx, e.target.value)}
                            className="bg-muted border border-border rounded p-1 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer text-foreground"
                          >
                            <option value="NEW">New</option>
                            <option value="OPENED">Opened</option>
                            <option value="USED">Used</option>
                            <option value="DAMAGED">Damaged</option>
                            <option value="DEFECTIVE">Defective</option>
                          </select>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={item.reason}
                            onChange={(e) => handleUpdateReason(idx, e.target.value)}
                            className="bg-muted border border-border rounded p-1 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer text-foreground"
                          >
                            <option value="Damaged">Damaged</option>
                            <option value="Defective">Defective</option>
                            <option value="Wrong Product">Wrong Product</option>
                            <option value="Customer Changed Mind">Changed Mind</option>
                            <option value="Warranty Claim">Warranty Claim</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Exchange selection details */}
          {fetchedOrder && (
            <Card className="bg-card border-border text-foreground">
              <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-muted-foreground">
                    Product Exchange Mode
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Allow swapping returned items for catalog replacements.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsExchange(!isExchange)}
                  className={`h-7 text-[10px] uppercase font-bold tracking-wider ${
                    isExchange
                      ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400'
                      : 'border-border'
                  }`}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                  Exchange Mode
                </Button>
              </CardHeader>
              {isExchange && (
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      New Swapped In items
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddExchangeItem}
                      className="h-6 text-[10px] border-border bg-muted text-foreground hover:text-foreground"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add exchange item
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {exchangeItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-2 items-center bg-muted/40 p-2 border border-border rounded-lg font-mono"
                      >
                        <span className="flex-1 font-sans text-left font-bold text-foreground">
                          {item.productName}
                        </span>
                        <span className="text-muted-foreground">${item.unitPrice.toFixed(2)}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveExchangeItem(idx)}
                          className="h-7 w-7 text-muted-foreground hover:text-rose-455"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {exchangeItems.length === 0 && (
                      <p className="text-[10px] text-muted-foreground text-center py-4 border border-dashed border-border rounded">
                        No replacement items added to swap queue.
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {/* Right column checklist summaries */}
        <div className="md:col-span-1">
          {fetchedOrder && (
            <Card className="bg-card border-border text-foreground">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold text-muted-foreground">
                  Claim Settlements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs font-mono">
                <div className="space-y-1.5 border-b border-border pb-3 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Returned value:</span>
                    <span className="text-rose-400 font-bold">
                      ${totalReturnedValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exchange value:</span>
                    <span className="text-emerald-400 font-bold">
                      ${totalExchangeValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground border-t border-border/65 pt-2">
                    <span>Price Diff:</span>
                    <span className={priceDifference > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {priceDifference > 0 ? '+' : '-'}${Math.abs(priceDifference).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Refund Method options */}
                <div className="space-y-1.5 text-left text-muted-foreground">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Refund Method
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value as any)}
                    className="w-full bg-muted border border-slate-855 rounded p-1.5 text-xs focus:outline-none focus:border-emerald-500 text-foreground"
                  >
                    <option value="CASH">Cash Refund</option>
                    <option value="CARD">Card Reverse</option>
                    <option value="MOBILE">Mobile wallet</option>
                    <option value="STORE_CREDIT">Store Credit</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-1.5 text-left text-muted-foreground">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Notes
                  </label>
                  <textarea
                    placeholder="Enter return reasons notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-muted border border-slate-855 rounded p-1.5 text-xs focus:outline-none focus:border-emerald-500 text-foreground h-16 resize-none"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createReturnMutation.isPending}
                  className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black uppercase text-xs tracking-wider"
                >
                  <span>Submit Return Claim</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

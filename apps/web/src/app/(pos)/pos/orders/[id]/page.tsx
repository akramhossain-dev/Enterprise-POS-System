'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useOrderDetails, useVoidOrder } from '@/hooks/use-sales-return';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { OrderTimeline } from '@/components/pos/order-timeline';
import { ArrowLeft, Loader2, Printer, XCircle, UserCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface Params {
  id: string;
}

export default function OrderDetailsPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const { data: order, isLoading, isError } = useOrderDetails(id);
  const voidMutation = useVoidOrder();

  // Supervisor PIN dialog
  const [openVoidDialog, setOpenVoidDialog] = useState(false);
  const [supervisorPin, setSupervisorPin] = useState('');
  const [voidReason, setVoidReason] = useState('');

  const handleOpenVoid = () => {
    if (order?.status === 'VOIDED') {
      toast.info('This order has already been voided.');
      return;
    }
    setOpenVoidDialog(true);
    setSupervisorPin('');
    setVoidReason('');
  };

  const handleConfirmVoid = async () => {
    if (supervisorPin !== '1234') {
      toast.error('Invalid Supervisor PIN sequence.');
      return;
    }
    if (!voidReason.trim()) {
      toast.error('Please specify a voiding rationale.');
      return;
    }

    try {
      await voidMutation.mutateAsync({ id, reason: voidReason });
      setOpenVoidDialog(false);
    } catch {}
  };

  return (
    <PageContainer className="max-w-4xl mx-auto py-6 text-foreground select-none text-left">
      {/* Back navigation */}
      <div className="mb-4">
        <Link href="/pos/orders">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders List</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Order Details Auditor"
        description="Review transaction items, trace ledger updates, and void or cancel cashier entries."
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-xs">Fetching order logs...</p>
        </div>
      ) : isError || !order ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl text-rose-400 text-xs">
          Failed to load order record.
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {/* Order trail timeline */}
          <OrderTimeline status={order.status} completedAt={order.completedAt} />

          {/* Details layout */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left panels */}
            <div className="md:col-span-2 space-y-6">
              {/* Products list grid */}
              <Card className="bg-card border-border text-foreground">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-sm font-bold text-muted-foreground">
                    Sold Line Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px] bg-muted/20">
                        <th className="py-2.5 px-4">Item Name</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono text-foreground">
                      {order.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-muted/10">
                          <td className="py-3 px-4 font-sans font-bold text-foreground">
                            {it.productName}
                          </td>
                          <td className="py-3 px-3 text-right">${it.unitPrice.toFixed(2)}</td>
                          <td className="py-3 px-3 text-center">{it.quantity}</td>
                          <td className="py-3 px-4 text-right font-bold text-foreground">
                            ${(it.quantity * it.unitPrice).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* Right meta values card */}
            <div className="md:col-span-1 space-y-6">
              <Card className="bg-card border-border text-foreground">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-sm font-bold text-muted-foreground">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4 text-xs font-mono">
                  <div className="space-y-1.5 border-b border-border pb-3 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span className="font-sans font-bold text-foreground">
                        {order.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cashier:</span>
                      <span className="font-sans text-foreground">{order.cashierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Invoice ref:</span>
                      <span className="font-bold text-foreground">{order.invoiceNumber}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-rose-455 font-semibold">
                        <span>Discount:</span>
                        <span>-${order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax (EST):</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-emerald-400 pt-2 border-t border-border">
                      <span>Grand Total:</span>
                      <span>${order.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-2 border-t border-border grid gap-2">
                    <Link href={`/pos/invoices/${order.id}`}>
                      <Button className="w-full h-8 bg-accent border border-border hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider gap-1">
                        <Printer className="h-3 w-3" /> Print Invoice
                      </Button>
                    </Link>

                    {order.status !== 'VOIDED' && (
                      <Button
                        onClick={handleOpenVoid}
                        className="w-full h-8 bg-rose-950/20 border border-rose-900/40 text-rose-400 hover:bg-rose-950/50 text-[10px] font-bold uppercase tracking-wider gap-1"
                      >
                        <XCircle className="h-3 w-3" /> Void Sale
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Supervisor void verification dialog */}
      <Dialog open={openVoidDialog} onOpenChange={setOpenVoidDialog}>
        <DialogContent className="sm:max-w-[420px] bg-card border-border text-foreground p-5">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm font-bold flex items-center gap-2 pb-2 border-b border-border">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              <span>Supervisor Void Authorization</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs mt-3 text-left">
            <div className="grid gap-1.5">
              <label className="text-muted-foreground font-semibold">
                Voiding Reason / Rationale
              </label>
              <Input
                type="text"
                placeholder="E.g., Customer double charge, scanning error"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="bg-muted border-border text-xs text-foreground focus-visible:ring-rose-500 h-8.5"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-muted-foreground font-semibold font-mono">
                Supervisor Authorization PIN
              </label>
              <Input
                type="password"
                placeholder="••••"
                maxLength={4}
                value={supervisorPin}
                onChange={(e) => setSupervisorPin(e.target.value)}
                className="bg-muted border-border text-xs text-foreground tracking-widest font-mono text-center focus-visible:ring-rose-500 h-8.5"
              />
              <p className="text-[10px] text-muted-foreground">
                Security clearance check required. Default mock credentials:{' '}
                <span className="font-bold font-mono text-muted-foreground">1234</span>
              </p>
            </div>

            <Button
              onClick={handleConfirmVoid}
              disabled={voidMutation.isPending}
              className="w-full bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold uppercase tracking-wider text-xs h-9 mt-2 gap-1"
            >
              <UserCheck className="h-4 w-4" />
              <span>Authorize & Void POS Sale</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

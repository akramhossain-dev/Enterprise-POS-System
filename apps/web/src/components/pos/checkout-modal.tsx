'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePOSStore } from '@/stores/pos.store';
import { CheckCircle, DollarSign, CreditCard, Smartphone, Split, Wallet2 } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grandTotal: number;
}

export function CheckoutModal({ open, onOpenChange, grandTotal }: CheckoutModalProps) {
  const { carts, activeCartId, addRecentOrder, clearCart } = usePOSStore();
  const activeCart = carts.find((c) => c.id === activeCartId);

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE' | 'SPLIT'>('CASH');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [changeDue, setChangeDue] = useState<number>(0);

  // Auto-fill exact amount on change
  useEffect(() => {
    if (open) {
      setReceivedAmount(grandTotal.toFixed(2));
      setPaymentMethod('CASH');
    }
  }, [open, grandTotal]);

  // Compute change when received amount changes
  useEffect(() => {
    const received = parseFloat(receivedAmount) || 0;
    const change = Math.max(0, received - grandTotal);
    setChangeDue(change);
  }, [receivedAmount, grandTotal]);

  const handleTenderClick = (amount: number) => {
    setReceivedAmount(amount.toFixed(2));
  };

  const handleExactAmount = () => {
    setReceivedAmount(grandTotal.toFixed(2));
  };

  const handleCompleteSale = () => {
    const received = parseFloat(receivedAmount) || 0;
    if (received < grandTotal) {
      toast.error(
        `Received amount ($${received.toFixed(2)}) is less than total due ($${grandTotal.toFixed(2)}).`,
      );
      return;
    }

    if (!activeCart) return;

    // Log recent sale record in store
    addRecentOrder({
      cart: {
        ...activeCart,
        items: activeCart.items.map((it) => ({ ...it })),
      },
      grandTotal,
      paymentMethod,
      paymentAmount: received,
      changeAmount: changeDue,
    });

    // Clear cart and close
    clearCart();
    onOpenChange(false);
    toast.success('Sale transaction completed successfully! Receipt queued for printing.');
  };

  // Quick cash triggers
  const cashTenders = [10, 20, 50, 100, 200, 500];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-[#0c1220] border-slate-800 text-slate-100 p-5">
        <DialogHeader>
          <DialogTitle className="text-slate-100 text-base font-bold flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Wallet2 className="h-5 w-5 text-emerald-400" />
            <span>Process Payment Checkout</span>
          </DialogTitle>
        </DialogHeader>

        {/* Pricing Summary */}
        <div className="grid grid-cols-2 gap-4 my-3 bg-slate-950 p-4 border border-slate-900 rounded-xl font-mono">
          <div className="text-left">
            <p className="text-slate-500 text-xs">Total Amount Due</p>
            <p className="text-2xl font-black text-slate-200">${grandTotal.toFixed(2)}</p>
          </div>
          <div className="text-right border-l border-slate-800 pl-4">
            <p className="text-slate-500 text-xs">Cash Change Due</p>
            <p className="text-2xl font-black text-emerald-400">${changeDue.toFixed(2)}</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Select Payment Method
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { mode: 'CASH', label: 'Cash', icon: DollarSign },
              { mode: 'CARD', label: 'Card', icon: CreditCard },
              { mode: 'MOBILE', label: 'Mobile', icon: Smartphone },
              { mode: 'SPLIT', label: 'Split', icon: Split },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = paymentMethod === item.mode;
              return (
                <Button
                  key={item.mode}
                  variant="outline"
                  onClick={() => setPaymentMethod(item.mode as any)}
                  className={`flex flex-col items-center justify-center h-16 rounded-xl border text-xs gap-1.5 transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400'
                      : 'border-slate-800 bg-[#0c1220] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Cash Tender assistance keys */}
        {paymentMethod === 'CASH' && (
          <div className="space-y-2 mt-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Quick Cash Tenders
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {cashTenders.map((tender) => (
                <Button
                  key={tender}
                  variant="outline"
                  onClick={() => handleTenderClick(tender)}
                  className="h-8 bg-slate-900 border-slate-850 hover:bg-slate-800 text-xs font-mono text-slate-300"
                >
                  ${tender}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExactAmount}
                className="flex-1 h-8 bg-slate-950 border-slate-800 hover:bg-slate-900 text-xs font-semibold text-emerald-400"
              >
                Exact Cash Tender
              </Button>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-2 mt-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Cash Tendered amount ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-sm">$</span>
            <Input
              type="number"
              placeholder="0.00"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value)}
              className="pl-7 bg-slate-950 border-slate-800 text-slate-100 font-mono text-sm focus-visible:ring-emerald-500 h-10"
              autoFocus
            />
          </div>
        </div>

        {/* Checkout Completion trigger */}
        <Button
          onClick={handleCompleteSale}
          className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm tracking-widest rounded-xl shadow-lg mt-4 gap-1.5"
        >
          <CheckCircle className="h-4.5 w-4.5" />
          <span>COMPLETE TRANSACTION [Ctrl+Enter]</span>
        </Button>
      </DialogContent>
    </Dialog>
  );
}

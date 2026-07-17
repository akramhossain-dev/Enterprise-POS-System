'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  FolderMinus,
  Percent,
  RefreshCw,
  Calculator,
  FolderHeart,
  CreditCard,
  Trash,
  Key,
} from 'lucide-react';
import { usePOSStore } from '@/stores/pos.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalculatorModal } from './calculator-modal';
import { CheckoutModal } from './checkout-modal';
import { toast } from 'sonner';

export function OrderSummaryPanel() {
  const { carts, activeCartId, clearCart, holdOrder, updateGlobalDiscount, updateGlobalTaxRate } =
    usePOSStore();

  const activeCart = carts.find((c) => c.id === activeCartId);
  const items = activeCart?.items || [];

  // Calculate pricing
  const subtotal = items.reduce((acc, it) => acc + (it.quantity * it.unitPrice - it.discount), 0);
  const globalDiscount = activeCart?.globalDiscount ?? 0;
  const globalTaxRate = activeCart?.globalTaxRate ?? 10;

  // Final tax estimation
  const afterDiscount = Math.max(0, subtotal - globalDiscount);
  const tax = afterDiscount * (globalTaxRate / 100);
  const grandTotal = afterDiscount + tax;

  // Dialog and inline editor states
  const [showCalculator, setShowCalculator] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHoldNotes, setShowHoldNotes] = useState(false);
  const [holdNotes, setHoldNotes] = useState('');

  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [isEditingTax, setIsEditingTax] = useState(false);

  const handleHoldOrder = () => {
    if (items.length === 0) {
      toast.error('Cannot hold an empty cart.');
      return;
    }
    holdOrder(holdNotes);
    setHoldNotes('');
    setShowHoldNotes(false);
  };

  const handleOpenDrawer = () => {
    toast.success('Cash Drawer opened successfully! (UI Trigger)');
  };

  return (
    <div className="flex flex-col bg-muted p-4 border-t border-border shrink-0 select-none">
      {/* Subtotal, discount and tax items detail rows */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-muted-foreground mb-4 border-b border-border pb-3">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-mono font-semibold text-foreground">${subtotal.toFixed(2)}</span>
        </div>

        {/* Global Discount input inline */}
        <div className="flex justify-between items-center">
          <span>Discount:</span>
          {isEditingDiscount ? (
            <input
              type="number"
              defaultValue={globalDiscount || ''}
              onBlur={(e) => {
                updateGlobalDiscount(parseFloat(e.target.value) || 0);
                setIsEditingDiscount(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateGlobalDiscount(parseFloat((e.target as HTMLInputElement).value) || 0);
                  setIsEditingDiscount(false);
                }
              }}
              className="w-16 h-6 bg-accent border border-border rounded px-1.5 text-xs text-right text-foreground focus:outline-none focus:border-emerald-500 font-mono"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingDiscount(true)}
              className="font-mono font-semibold text-amber-400 hover:underline"
            >
              -${globalDiscount.toFixed(2)}
            </button>
          )}
        </div>

        {/* Global Tax Rate input inline */}
        <div className="flex justify-between items-center">
          <span>Tax Rate:</span>
          {isEditingTax ? (
            <input
              type="number"
              defaultValue={globalTaxRate || ''}
              onBlur={(e) => {
                updateGlobalTaxRate(parseFloat(e.target.value) || 0);
                setIsEditingTax(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateGlobalTaxRate(parseFloat((e.target as HTMLInputElement).value) || 0);
                  setIsEditingTax(false);
                }
              }}
              className="w-16 h-6 bg-accent border border-border rounded px-1.5 text-xs text-right text-foreground focus:outline-none focus:border-emerald-500 font-mono"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingTax(true)}
              className="font-mono font-semibold text-emerald-400 hover:underline"
            >
              {globalTaxRate}%
            </button>
          )}
        </div>

        <div className="flex justify-between">
          <span>Tax Value:</span>
          <span className="font-mono font-semibold text-foreground">${tax.toFixed(2)}</span>
        </div>
      </div>

      {/* Main Grand Total Row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-foreground uppercase tracking-wider">
          Total Amount
        </span>
        <span className="text-2xl font-black font-mono text-emerald-400">
          ${grandTotal.toFixed(2)}
        </span>
      </div>

      {/* Quick Action buttons strip */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {/* Hold order inline dialog popover */}
        <div className="relative col-span-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHoldNotes(!showHoldNotes)}
            className={`h-9 w-full border-border text-foreground text-xs gap-1 ${
              showHoldNotes
                ? 'bg-emerald-950/20 text-emerald-450 border-emerald-900'
                : 'bg-card hover:bg-accent'
            }`}
          >
            <FolderHeart className="h-4 w-4" />
            <span>Hold [F3]</span>
          </Button>

          {showHoldNotes && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-card border border-border rounded-lg p-3 shadow-2xl z-50 text-left">
              <p className="font-bold mb-2 text-xs text-foreground">Hold order details</p>
              <Input
                type="text"
                placeholder="Enter notes (e.g. Table 4)"
                value={holdNotes}
                onChange={(e) => setHoldNotes(e.target.value)}
                className="bg-muted border-border h-8 text-xs focus-visible:ring-emerald-500 mb-2.5"
                autoFocus
              />
              <div className="flex justify-end gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => setShowHoldNotes(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={handleHoldOrder}
                >
                  Save Hold
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Clear cart action */}
        <Button
          variant="outline"
          size="sm"
          onClick={clearCart}
          className="h-9 border-border bg-card hover:bg-rose-950/20 text-rose-400 text-xs gap-1"
        >
          <Trash className="h-4 w-4" />
          <span>Clear</span>
        </Button>

        {/* Calculator widget toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCalculator(true)}
          className="h-9 border-border bg-card hover:bg-accent text-foreground text-xs gap-1"
        >
          <Calculator className="h-4 w-4" />
          <span>Calc</span>
        </Button>

        {/* Open Drawer Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenDrawer}
          className="h-9 border-border bg-card hover:bg-accent text-foreground text-xs gap-1"
        >
          <Key className="h-4 w-4" />
          <span>Drawer</span>
        </Button>
      </div>

      {/* Main Payment Checkout button */}
      <Button
        onClick={() => setShowCheckout(true)}
        disabled={items.length === 0}
        className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm tracking-widest rounded-xl shadow-lg shadow-emerald-500/10 gap-1.5"
      >
        <CreditCard className="h-4.5 w-4.5" />
        <span>PAYMENT CHECKOUT [F6]</span>
      </Button>

      {/* Calculator modal widget mount */}
      <CalculatorModal open={showCalculator} onOpenChange={setShowCalculator} />

      {/* Payment checkout details dashboard overlay */}
      <CheckoutModal open={showCheckout} onOpenChange={setShowCheckout} grandTotal={grandTotal} />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePOSStore } from '@/stores/pos.store';
import { useCreateTransaction } from '@/hooks/use-checkout';
import {
  CheckCircle,
  DollarSign,
  CreditCard,
  Smartphone,
  Split,
  Wallet2,
  Trash2,
  Plus,
  Gift,
  Award,
  CircleAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import type { POSPaymentMethod, PaymentSplitItem } from '@/types/checkout';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grandTotal: number;
}

export function CheckoutModal({ open, onOpenChange, grandTotal }: CheckoutModalProps) {
  const { carts, activeCartId, clearCart } = usePOSStore();
  const activeCart = carts.find((c) => c.id === activeCartId);
  const currentCustomer = activeCart?.customer;
  const createTxMutation = useCreateTransaction();

  // Mode: Normal vs Split Payments
  const [isSplit, setIsSplit] = useState<boolean>(false);

  // Split payment list state
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplitItem[]>([
    { method: 'CASH', amount: 0 },
  ]);

  // Discount & Loyalty modifications
  const [redeemedPoints, setRedeemedPoints] = useState<number>(0);
  const [giftCardCode, setGiftCardCode] = useState<string>('');
  const [giftCardValue, setGiftCardValue] = useState<number>(0);
  const [storeCreditRedeemed, setStoreCreditRedeemed] = useState<number>(0);

  // Single payment details (if not split)
  const [singleMethod, setSingleMethod] = useState<POSPaymentMethod>('CASH');
  const [singleAmount, setSingleAmount] = useState<string>('');

  // Calculations
  const pointsValue = redeemedPoints * 0.05; // 1 point = $0.05
  const deductionsTotal = pointsValue + giftCardValue + storeCreditRedeemed;
  const finalTotalDue = Math.max(0, grandTotal - deductionsTotal);

  const totalSplitsEntered = paymentSplits.reduce((acc, it) => acc + it.amount, 0);
  const totalReceived = isSplit ? totalSplitsEntered : parseFloat(singleAmount) || 0;

  const changeDue = Math.max(0, totalReceived - finalTotalDue);
  const remainingBalance = Math.max(0, finalTotalDue - totalReceived);

  // Initialize
  useEffect(() => {
    if (open) {
      setIsSplit(false);
      setSingleMethod('CASH');
      setSingleAmount(finalTotalDue.toFixed(2));
      setPaymentSplits([{ method: 'CASH', amount: finalTotalDue }]);
      setRedeemedPoints(0);
      setGiftCardCode('');
      setGiftCardValue(0);
      setStoreCreditRedeemed(0);
    }
  }, [open, grandTotal]);

  // Recalculate default amounts when deductions update final total
  useEffect(() => {
    if (!isSplit) {
      setSingleAmount(finalTotalDue.toFixed(2));
    } else {
      // Re-allocate remainder to the first split entry
      setPaymentSplits((prev) =>
        prev.map((it, idx) =>
          idx === 0 ? { ...it, amount: finalTotalDue } : { ...it, amount: 0 },
        ),
      );
    }
  }, [finalTotalDue, isSplit]);

  const handleAddSplit = () => {
    setPaymentSplits([...paymentSplits, { method: 'CASH', amount: 0 }]);
  };

  const handleRemoveSplit = (idx: number) => {
    setPaymentSplits(paymentSplits.filter((_, i) => i !== idx));
  };

  const handleUpdateSplit = (idx: number, fields: Partial<PaymentSplitItem>) => {
    setPaymentSplits(paymentSplits.map((it, i) => (i === idx ? { ...it, ...fields } : it)));
  };

  const handleApplyGiftCard = () => {
    if (!giftCardCode.trim()) return;
    // Mock validation
    if (giftCardCode.toUpperCase() === 'GIFT100') {
      setGiftCardValue(100);
      toast.success('Gift Card applied: $100.00 credit added.');
    } else if (giftCardCode.toUpperCase() === 'GIFT50') {
      setGiftCardValue(50);
      toast.success('Gift Card applied: $50.00 credit added.');
    } else {
      toast.error('Invalid or expired Gift Card code.');
    }
  };

  const handleApplyLoyalty = () => {
    if (!currentCustomer) return;
    const maxPoints = currentCustomer.loyaltyPoints ?? 0;
    if (redeemedPoints > maxPoints) {
      toast.warning(`Customer only has ${maxPoints} loyalty points available.`);
      return;
    }
    toast.success(
      `Redeemed ${redeemedPoints} points for a credit value of $${pointsValue.toFixed(2)}`,
    );
  };

  const handleApplyStoreCredit = () => {
    if (!currentCustomer) return;
    const availableCredit = parseFloat(currentCustomer.currentBalance || '0');
    if (storeCreditRedeemed > availableCredit) {
      toast.warning(`Customer only has $${availableCredit.toFixed(2)} store credit available.`);
      return;
    }
    toast.success(`Applied $${storeCreditRedeemed.toFixed(2)} store credit to transaction.`);
  };

  const handleCompleteSale = async () => {
    if (totalReceived < finalTotalDue) {
      toast.error(
        `Insufficient Payment. Paid $${totalReceived.toFixed(2)} of $${finalTotalDue.toFixed(2)} due.`,
      );
      return;
    }

    if (!activeCart) return;

    const payload = {
      cartName: activeCart.name,
      customerId: activeCart.customerId,
      customerName: currentCustomer ? currentCustomer.fullName : 'Walk-in Customer',
      itemsCount: activeCart.items.reduce((acc, it) => acc + it.quantity, 0),
      subtotal: activeCart.items.reduce(
        (acc, it) => acc + (it.quantity * it.unitPrice - it.discount),
        0,
      ),
      discount: deductionsTotal + activeCart.globalDiscount,
      discountType: 'FIXED' as const,
      tax: grandTotal * 0.1, // Approx tax
      grandTotal: finalTotalDue,
      payments: isSplit
        ? paymentSplits
        : [{ method: singleMethod, amount: parseFloat(singleAmount) || 0 }],
      paymentStatus: 'PAID' as const,
      changeAmount: changeDue,
      cashierName: 'Cashier Admin',
    };

    try {
      await createTxMutation.mutateAsync(payload);
      clearCart();
      onOpenChange(false);
      toast.success('Checkout sale transaction completed successfully!');
    } catch {
      toast.error('Failed to post payment transaction.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-cardard border-border text-foreground p-5 overflow-y-auto max-h-[90vh] custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-bold flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <Wallet2 className="h-5 w-5 text-emerald-400" />
              <span>Checkout Settlement Panel</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSplit(!isSplit)}
              className={cn(
                'h-7 text-[10px] uppercase font-bold tracking-wider',
                isSplit && 'border-emerald-500 bg-emerald-950/20 text-emerald-400',
              )}
            >
              <Split className="h-3.5 w-3.5 mr-1" />
              {isSplit ? 'Single Pay' : 'Split Payments'}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Pricing Dashboard */}
        <div className="grid grid-cols-3 gap-3 my-3 bg-muted p-3.5 border border-border rounded-xl font-mono text-left">
          <div>
            <span className="text-[10px] text-muted-foreground block uppercase font-bold">
              Grand Total
            </span>
            <span className="text-lg font-black text-foreground">${grandTotal.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block uppercase font-bold">
              Total Received
            </span>
            <span className="text-lg font-black text-foreground">${totalReceived.toFixed(2)}</span>
          </div>
          <div className="border-l border-border pl-3">
            <span className="text-[10px] text-muted-foreground block uppercase font-bold">
              {remainingBalance > 0 ? 'Balance Due' : 'Cash Change'}
            </span>
            <span
              className={cn(
                'text-lg font-black',
                remainingBalance > 0 ? 'text-rose-500' : 'text-emerald-400',
              )}
            >
              ${remainingBalance > 0 ? remainingBalance.toFixed(2) : changeDue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Guest vs Customer details (Loyalty, credits modifiers) */}
        {currentCustomer ? (
          <div className="bg-background border border-border rounded-xl p-3 space-y-2 text-xs">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-400" />
              <span>Customer Account: {currentCustomer.fullName}</span>
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-2 text-left">
              {/* Loyalty Points redemption */}
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground block">
                  Redeem Loyalty Points (Bal: {currentCustomer.loyaltyPoints ?? 0})
                </span>
                <div className="flex gap-1.5">
                  <Input
                    type="number"
                    placeholder="Points"
                    value={redeemedPoints || ''}
                    onChange={(e) => setRedeemedPoints(parseInt(e.target.value) || 0)}
                    className="h-8 text-xs bg-muted border-border focus-visible:ring-emerald-500"
                  />
                  <Button
                    size="sm"
                    onClick={handleApplyLoyalty}
                    className="h-8 bg-accent border border-border text-emerald-400 hover:bg-slate-800"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Store credit redemption */}
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground block">
                  Use Store Credit (Max: ${Number(currentCustomer.currentBalance || 0).toFixed(2)})
                </span>
                <div className="flex gap-1.5">
                  <Input
                    type="number"
                    placeholder="Credit Amount"
                    value={storeCreditRedeemed || ''}
                    onChange={(e) => setStoreCreditRedeemed(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs bg-muted border-border focus-visible:ring-emerald-500"
                  />
                  <Button
                    size="sm"
                    onClick={handleApplyStoreCredit}
                    className="h-8 bg-accent border border-border text-emerald-400 hover:bg-slate-800"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-muted-foreground text-left px-1.5">
            Checkout running as Guest. Link customer to redeem loyalty credits and balance.
          </div>
        )}

        {/* Gift Card modifier */}
        <div className="mt-3 bg-background border border-border rounded-xl p-3 text-xs text-left">
          <span className="font-bold text-foreground flex items-center gap-1.5 mb-1.5">
            <Gift className="h-4 w-4 text-emerald-400" />
            <span>Apply Coupon or Gift Card code</span>
          </span>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter Gift Card code (E.g. GIFT50, GIFT100)"
              value={giftCardCode}
              onChange={(e) => setGiftCardCode(e.target.value)}
              className="h-8 bg-muted border-border text-xs focus-visible:ring-emerald-500"
            />
            <Button
              size="sm"
              onClick={handleApplyGiftCard}
              className="h-8 bg-accent border border-border text-emerald-400 hover:bg-slate-800"
            >
              Validate
            </Button>
          </div>
        </div>

        {/* Single Payment Method selectors */}
        {!isSplit ? (
          <div className="space-y-3 mt-4 text-left">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Single Payment Details
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mode: 'CASH', label: 'Cash', icon: DollarSign },
                { mode: 'CARD', label: 'Credit Card', icon: CreditCard },
                { mode: 'MOBILE', label: 'Mobile Bank', icon: Smartphone },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = singleMethod === item.mode;
                return (
                  <Button
                    key={item.mode}
                    variant="outline"
                    onClick={() => setSingleMethod(item.mode as any)}
                    className={cn(
                      'flex flex-col items-center justify-center h-16 rounded-xl border text-xs gap-1.5 transition-all',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400'
                        : 'border-border bg-cardard text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>

            <div className="grid gap-2.5 mt-3">
              <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                Tender amount received ($)
              </span>
              <Input
                type="number"
                value={singleAmount}
                onChange={(e) => setSingleAmount(e.target.value)}
                className="bg-muted border-border text-foreground font-mono text-sm focus-visible:ring-emerald-500"
              />
            </div>
          </div>
        ) : (
          /* Split Payments manager */
          <div className="space-y-3 mt-4 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Split Payment Entries
              </label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddSplit}
                className="h-6 text-[10px] bg-accent border-border text-emerald-400 hover:bg-slate-800"
              >
                <Plus className="h-3 w-3 mr-1" /> Add split
              </Button>
            </div>

            <div className="space-y-2">
              {paymentSplits.map((split, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 items-center bg-muted/30 p-2 border border-border rounded-lg"
                >
                  {/* Method dropdown */}
                  <select
                    value={split.method}
                    onChange={(e) => handleUpdateSplit(idx, { method: e.target.value as any })}
                    className="bg-accent border border-border text-foreground rounded p-1 text-xs focus:outline-none"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="MOBILE">Mobile</option>
                  </select>

                  {/* Amount entry */}
                  <input
                    type="number"
                    placeholder="Amount"
                    value={split.amount || ''}
                    onChange={(e) =>
                      handleUpdateSplit(idx, { amount: parseFloat(e.target.value) || 0 })
                    }
                    className="flex-1 bg-accent border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none font-mono"
                  />

                  {/* Remove button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={paymentSplits.length <= 1}
                    onClick={() => handleRemoveSplit(idx)}
                    className="h-7 w-7 text-muted-foreground hover:text-rose-400 hover:bg-accent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation warning */}
        {remainingBalance > 0 && (
          <div className="flex items-center gap-1.5 mt-4 text-xs text-amber-500 bg-amber-950/10 p-2 rounded-lg border border-amber-900/30 text-left">
            <CircleAlert className="h-4 w-4 shrink-0" />
            <span>
              Underpaid: Transaction requires remaining amount of ${remainingBalance.toFixed(2)} to
              settle.
            </span>
          </div>
        )}

        {/* Complete Checkout action */}
        <Button
          onClick={handleCompleteSale}
          disabled={totalReceived < finalTotalDue || createTxMutation.isPending}
          className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm tracking-widest rounded-xl shadow-lg mt-4 gap-1.5 disabled:opacity-50"
        >
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{createTxMutation.isPending ? 'PROCESSING SALE...' : 'COMPLETE SALE RECEIPT'}</span>
        </Button>
      </DialogContent>
    </Dialog>
  );
}

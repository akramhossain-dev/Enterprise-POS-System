'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Eye, BadgeCheck, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { PaymentVoucher, ReceiptVoucher } from '@/types/accounting';

interface VoucherCardProps {
  voucher: PaymentVoucher | ReceiptVoucher;
  onApprove?: (id: string) => void;
  onCancel?: (id: string) => void;
  onPrint?: (voucher: any) => void;
  onView?: (voucher: any) => void;
  isPending?: boolean;
}

export function VoucherCard({
  voucher,
  onApprove,
  onCancel,
  onPrint,
  onView,
  isPending = false,
}: VoucherCardProps) {
  const isPayment = 'voucherNumber' in voucher;
  const voucherNum = isPayment
    ? (voucher as PaymentVoucher).voucherNumber
    : (voucher as ReceiptVoucher).receiptNumber;
  const person = isPayment
    ? (voucher as PaymentVoucher).payee
    : (voucher as ReceiptVoucher).receivedFrom;
  const status = isPayment ? (voucher as PaymentVoucher).approvalStatus : 'APPROVED';

  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <BadgeCheck className="h-3 w-3" />
            <span>Approved</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-455">
            <XCircle className="h-3 w-3" />
            <span>Cancelled</span>
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertCircle className="h-3 w-3" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <Card className="bg-cardard border-border text-foreground hover:border-slate-700 transition-colors text-left flex flex-col justify-between">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold font-mono tracking-widest text-muted-foreground uppercase">
              {isPayment ? 'Payment Voucher' : 'Receipt Voucher'}
            </span>
            <h4 className="text-sm font-black font-mono text-foreground truncate max-w-[180px]">
              {voucherNum}
            </h4>
          </div>
          {getStatusBadge(status)}
        </div>

        {/* Amount & Person */}
        <div className="space-y-1 py-1">
          <p className="text-xl font-black font-mono text-emerald-400">
            {formatCurrency(voucher.amount)}
          </p>
          <div className="text-xs">
            <span className="text-muted-foreground">{isPayment ? 'Payee: ' : 'From: '}</span>
            <span className="font-bold text-foreground truncate max-w-[200px] inline-block align-bottom">
              {person}
            </span>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-border pt-2.5">
          <div>
            <span className="text-muted-foreground block">Date</span>
            <span className="text-muted-foreground">{new Date(voucher.date).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Method</span>
            <span className="text-muted-foreground">{voucher.paymentMethod}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground block">Reference</span>
            <span className="text-muted-foreground truncate block">{voucher.reference}</span>
          </div>
        </div>
      </CardContent>

      {/* Action Footer */}
      <div className="px-4 pb-4 flex gap-1.5 border-t border-border/60 pt-3">
        {onView && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(voucher)}
            className="h-8 flex-1 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <Eye className="h-3 w-3 mr-1" />
            <span>Details</span>
          </Button>
        )}

        {isPayment && status === 'DRAFT' && onApprove && (
          <Button
            size="sm"
            onClick={() => onApprove(voucher.id)}
            disabled={isPending}
            className="h-8 flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-bold uppercase tracking-wider"
          >
            <span>Approve</span>
          </Button>
        )}

        {onPrint && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => onPrint(voucher)}
            className="h-8 w-8 shrink-0 border-border bg-muted text-muted-foreground hover:text-foreground"
            title="Print Voucher UI"
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </Card>
  );
}

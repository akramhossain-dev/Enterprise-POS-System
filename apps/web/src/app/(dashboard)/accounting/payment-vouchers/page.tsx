'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  useVouchers,
  useCreatePaymentVoucher,
  useApproveVoucher,
  useCancelVoucher,
} from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/accounting/accounting-skeletons';
import { VoucherCard } from '@/components/accounting/voucher-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ArrowLeft, Search, Plus, Printer, FileText, BadgeCheck, X } from 'lucide-react';
import type { PaymentVoucher } from '@/types/accounting';

const paymentVoucherSchema = zod.object({
  payee: zod.string().min(3, 'Payee name must be at least 3 characters.'),
  amount: zod.coerce.number().gt(0, 'Amount must be greater than 0.'),
  paymentMethod: zod.enum(['CASH', 'BANK', 'CARD', 'MOBILE']),
  reference: zod.string().min(3, 'Reference number is required.'),
  date: zod.string().min(1, 'Date is required.'),
  notes: zod.string().optional(),
});

type PaymentVoucherFormValues = zod.infer<typeof paymentVoucherSchema>;

export default function PaymentVouchersPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activePrintVoucher, setActivePrintVoucher] = useState<PaymentVoucher | null>(null);

  // Fetch Payment Vouchers (Type: PAYMENT)
  const {
    data: voucherData,
    isLoading,
    refetch,
  } = useVouchers({
    q: query || undefined,
    type: 'PAYMENT',
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page: currentPage,
    limit: 12,
  });

  const createMutation = useCreatePaymentVoucher();
  const approveMutation = useApproveVoucher();
  const cancelMutation = useCancelVoucher();

  const vouchers = (voucherData?.data || []) as PaymentVoucher[];
  const meta = voucherData?.meta;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentVoucherFormValues>({
    resolver: zodResolver(paymentVoucherSchema),
    defaultValues: {
      payee: '',
      amount: 0,
      paymentMethod: 'CASH',
      reference: '',
      date: new Date().toISOString().substring(0, 10),
      notes: '',
    },
  });

  const onSubmit = async (values: PaymentVoucherFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      setIsCreateOpen(false);
      reset();
      void refetch();
    } catch {}
  };

  const handleApprove = async (id: string) => {
    const confirm = window.confirm(
      'Process approval for this Payment Voucher? This will charge cash/bank balances.',
    );
    if (confirm) {
      try {
        await approveMutation.mutateAsync(id);
        void refetch();
      } catch {}
    }
  };

  const handleCancel = async (id: string) => {
    const confirm = window.confirm('Cancel this Payment Voucher?');
    if (confirm) {
      try {
        await cancelMutation.mutateAsync(id);
        void refetch();
      } catch {}
    }
  };

  const handlePrint = (voucher: PaymentVoucher) => {
    setActivePrintVoucher(voucher);
    // Delay to allow state update before print dialog triggers
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <PageContainer className="text-foreground select-none text-left print:p-0 print:bg-white print:text-black">
      {/* Printable Voucher Shell (Only shown when printing) */}
      {activePrintVoucher && (
        <div className="hidden print:block p-8 bg-white border-2 border-black rounded-lg max-w-2xl mx-auto font-mono text-black text-xs space-y-6">
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <h2 className="text-lg font-black uppercase">Payment Voucher</h2>
              <p className="text-[10px] text-gray-500">Corporate Finance Settlement Division</p>
            </div>
            <div className="text-right text-[11px]">
              <p className="font-bold">No: {activePrintVoucher.voucherNumber}</p>
              <p>Date: {new Date(activePrintVoucher.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between border-b border-gray-300 pb-1.5">
              <span className="text-gray-500 font-sans">Paid To (Payee):</span>
              <span className="font-bold uppercase">{activePrintVoucher.payee}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1.5">
              <span className="text-gray-500 font-sans">Amount Settled:</span>
              <span className="font-black text-sm">${activePrintVoucher.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1.5">
              <span className="text-gray-500 font-sans">Payment Method:</span>
              <span>{activePrintVoucher.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1.5">
              <span className="text-gray-500 font-sans">Ref Number:</span>
              <span>{activePrintVoucher.reference}</span>
            </div>
          </div>

          {activePrintVoucher.notes && (
            <div className="pt-2">
              <span className="text-gray-500 font-sans block text-[10px] pb-1">
                Particulars / Memo:
              </span>
              <p className="p-3 bg-gray-50 border rounded text-[11px]">
                {activePrintVoucher.notes}
              </p>
            </div>
          )}

          {/* Signature fields */}
          <div className="grid grid-cols-3 gap-8 pt-12 text-center text-[10px] font-sans">
            <div className="space-y-4">
              <div className="border-b border-black h-8" />
              <span>Prepared By</span>
            </div>
            <div className="space-y-4">
              <div className="border-b border-black h-8" />
              <span>Authorized Signature</span>
            </div>
            <div className="space-y-4">
              <div className="border-b border-black h-8" />
              <span>Payee Signature</span>
            </div>
          </div>
        </div>
      )}

      {/* Screen layout */}
      <div className="print:hidden space-y-4">
        {/* Back Link */}
        <div className="mb-4 flex justify-between items-center">
          <Link href="/accounting">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Accounting Dashboard</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => {
              reset();
              setIsCreateOpen(true);
            }}
            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Create Voucher</span>
          </Button>
        </div>

        <PageHeader
          title="Payment Vouchers"
          description="Log outbound payout entries, trace vendor payment approvals, and print standard corporate vouchers."
        />

        {/* Toolbar filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4 mb-6">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search payee or ref..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 bg-muted border-border text-foreground text-xs focus-visible:ring-emerald-500 h-9"
              />
            </div>

            {/* Status select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card border border-border text-muted-foreground rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[120px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="APPROVED">Approved</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Voucher Cards Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-card border border-border rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : vouchers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vouchers.map((v) => (
              <VoucherCard
                key={v.id}
                voucher={v}
                onApprove={handleApprove}
                onCancel={handleCancel}
                onPrint={handlePrint}
                isPending={approveMutation.isPending || cancelMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <p className="text-xs">No payment vouchers found in this ledger period.</p>
          </div>
        )}
      </div>

      {/* Create Voucher Dialog Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-black uppercase text-foreground tracking-wider flex items-center gap-1.5">
              <FileText className="h-5 w-5 text-indigo-400" />
              <span>Generate Payment Voucher</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Prepare a corporate disbursement authorization sheet.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm">
            {/* Payee name */}
            <div className="grid gap-1.5 text-left">
              <label className="text-muted-foreground font-semibold">
                Payee (Zenith/Vendor name) *
              </label>
              <Input
                type="text"
                placeholder="E.g., Zenith Shipping Co."
                {...register('payee')}
                className="bg-muted border-slate-855 text-xs text-foreground focus-visible:ring-emerald-500"
              />
              {errors.payee && <p className="text-[10px] text-rose-455">{errors.payee.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div className="grid gap-1.5">
                <label className="text-muted-foreground font-semibold font-mono">
                  Amount ($) *
                </label>
                <Input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="0.00"
                  {...register('amount')}
                  className="bg-muted border-slate-855 text-xs text-foreground font-mono focus-visible:ring-emerald-500 h-9"
                />
                {errors.amount && (
                  <p className="text-[10px] text-rose-455 font-mono">{errors.amount.message}</p>
                )}
              </div>

              {/* Method */}
              <div className="grid gap-1.5 text-left">
                <label className="text-muted-foreground font-semibold">Payment Method *</label>
                <select
                  {...register('paymentMethod')}
                  className="bg-muted border border-slate-855 rounded p-2 text-xs text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer h-9"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="CARD">Card Payment</option>
                  <option value="MOBILE">Mobile Money</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Reference */}
              <div className="grid gap-1.5">
                <label className="text-muted-foreground font-semibold">Reference *</label>
                <Input
                  type="text"
                  placeholder="Invoiced Code"
                  {...register('reference')}
                  className="bg-muted border-slate-855 text-xs text-foreground focus-visible:ring-emerald-500 h-9"
                />
                {errors.reference && (
                  <p className="text-[10px] text-rose-455">{errors.reference.message}</p>
                )}
              </div>

              {/* Date */}
              <div className="grid gap-1.5 text-left">
                <label className="text-muted-foreground font-semibold">Date *</label>
                <Input
                  type="date"
                  required
                  {...register('date')}
                  className="bg-muted border-slate-855 text-xs text-foreground focus-visible:ring-emerald-500 h-9"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-1.5 text-left">
              <label className="text-muted-foreground font-semibold">Memo Notes</label>
              <textarea
                placeholder="Audit notes or transaction description..."
                {...register('notes')}
                className="w-full bg-muted border border-slate-855 rounded p-2 text-xs text-foreground focus:outline-none focus:border-emerald-500 h-16 resize-none"
              />
            </div>

            {/* Actions */}
            <DialogFooter className="flex sm:justify-between items-center pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 border-border text-muted-foreground hover:text-foreground bg-card"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs"
              >
                {createMutation.isPending ? 'CREATING...' : 'SAVE DRAFT'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

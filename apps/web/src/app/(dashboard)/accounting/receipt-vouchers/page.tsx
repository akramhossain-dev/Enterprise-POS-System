'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useVouchers, useCreateReceiptVoucher } from '@/hooks/use-accounting';
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
import { ArrowLeft, Search, Plus, FileText, BadgeDollarSign } from 'lucide-react';
import type { ReceiptVoucher } from '@/types/accounting';

const receiptVoucherSchema = zod.object({
  receivedFrom: zod.string().min(3, 'Depositor name must be at least 3 characters.'),
  amount: zod.coerce.number().gt(0, 'Amount must be greater than 0.'),
  paymentMethod: zod.enum(['CASH', 'BANK', 'CARD', 'MOBILE']),
  reference: zod.string().min(3, 'Reference number is required.'),
  date: zod.string().min(1, 'Date is required.'),
  notes: zod.string().optional(),
});

type ReceiptVoucherFormValues = zod.infer<typeof receiptVoucherSchema>;

export default function ReceiptVouchersPage() {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activePrintReceipt, setActivePrintReceipt] = useState<ReceiptVoucher | null>(null);

  // Fetch Receipt Vouchers (Type: RECEIPT)
  const {
    data: voucherData,
    isLoading,
    refetch,
  } = useVouchers({
    q: query || undefined,
    type: 'RECEIPT',
    page: currentPage,
    limit: 12,
  });

  const createMutation = useCreateReceiptVoucher();

  const vouchers = (voucherData?.data || []) as ReceiptVoucher[];
  const meta = voucherData?.meta;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReceiptVoucherFormValues>({
    resolver: zodResolver(receiptVoucherSchema),
    defaultValues: {
      receivedFrom: '',
      amount: 0,
      paymentMethod: 'CASH',
      reference: '',
      date: new Date().toISOString().substring(0, 10),
      notes: '',
    },
  });

  const onSubmit = async (values: ReceiptVoucherFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      setIsCreateOpen(false);
      reset();
      void refetch();
    } catch {}
  };

  const handlePrint = (receipt: ReceiptVoucher) => {
    setActivePrintReceipt(receipt);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <PageContainer className="text-foreground select-none text-left print:p-0 print:bg-white print:text-black">
      {/* Printable Receipt Slip (Shown when printing) */}
      {activePrintReceipt && (
        <div className="hidden print:block p-8 bg-white border-2 border-black rounded-lg max-w-md mx-auto font-mono text-black text-xs space-y-5">
          <div className="text-center border-b-2 border-black pb-3">
            <h2 className="text-md font-black uppercase">Official Inward Receipt</h2>
            <p className="text-[9px] text-gray-500">POS Retail Outlets Settlement Desk</p>
          </div>

          <div className="space-y-2 text-[10px] pt-1">
            <p className="font-bold text-center text-xs pb-2">
              Receipt No: {activePrintReceipt.receiptNumber}
            </p>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Date:</span>
              <span>{new Date(activePrintReceipt.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Received From:</span>
              <span className="font-bold uppercase">{activePrintReceipt.receivedFrom}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Payment Inflow Method:</span>
              <span>{activePrintReceipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Ref Code:</span>
              <span>{activePrintReceipt.reference}</span>
            </div>
            <div className="flex justify-between border-b-2 border-black py-1.5 font-black text-xs">
              <span>Amount Received:</span>
              <span>${activePrintReceipt.amount.toFixed(2)}</span>
            </div>
          </div>

          {activePrintReceipt.notes && (
            <div className="text-[9px] pt-1">
              <span className="text-gray-500 block pb-0.5">Particulars Memo:</span>
              <p className="p-2 bg-gray-50 border rounded">{activePrintReceipt.notes}</p>
            </div>
          )}

          <div className="flex justify-between items-end pt-12 text-[9px] text-center">
            <div className="w-[120px]">
              <div className="border-b border-black h-6" />
              <p className="pt-1">Receiver Signature</p>
            </div>
            <div className="w-[120px]">
              <div className="border-b border-black h-6" />
              <p className="pt-1">Depositor Signature</p>
            </div>
          </div>
        </div>
      )}

      {/* Screen view */}
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
            <span>Record Receipt</span>
          </Button>
        </div>

        <PageHeader
          title="Receipt Vouchers"
          description="Track incoming customer deposits, log operational cash inflows, and print clean confirmation receipts."
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4 mb-6">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search source or reference..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 bg-muted border-border text-foreground text-xs focus-visible:ring-emerald-500 h-9"
            />
          </div>
        </div>

        {/* Receipt Cards Grid */}
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
              <VoucherCard key={v.id} voucher={v} onPrint={handlePrint} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <p className="text-xs">No receipt vouchers logged in this ledger period.</p>
          </div>
        )}
      </div>

      {/* Create Receipt Dialog Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-black uppercase text-foreground tracking-wider flex items-center gap-1.5">
              <BadgeDollarSign className="h-5 w-5 text-emerald-450" />
              <span>Record Inward Receipt</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Log incoming funds from customers or partners.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm">
            {/* Depositor name */}
            <div className="grid gap-1.5 text-left">
              <label className="text-muted-foreground font-semibold">
                Received From (Depositor) *
              </label>
              <Input
                type="text"
                placeholder="E.g., apex global customer"
                {...register('receivedFrom')}
                className="bg-muted border-slate-855 text-xs text-foreground focus-visible:ring-emerald-500"
              />
              {errors.receivedFrom && (
                <p className="text-[10px] text-rose-455">{errors.receivedFrom.message}</p>
              )}
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
                  placeholder="Source identifier ID"
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
                {createMutation.isPending ? 'CREATING...' : 'LOG RECEIPT'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

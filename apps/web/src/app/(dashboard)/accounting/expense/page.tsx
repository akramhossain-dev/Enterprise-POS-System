'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useExpenses, useCreateExpense, useAccounts } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/accounting/accounting-skeletons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ArrowLeft, Search, Plus, BadgeMinus } from 'lucide-react';

const expenseFormSchema = zod.object({
  accountId: zod.string().min(1, 'Expense category is required.'),
  amount: zod.coerce.number().gt(0, 'Amount must be greater than 0.'),
  paymentMethod: zod.enum(['CASH', 'BANK', 'CARD', 'MOBILE']),
  reference: zod.string().min(3, 'Reference must be at least 3 characters.'),
  date: zod.string().min(1, 'Transaction date is required.'),
  notes: zod.string().optional(),
});

type ExpenseFormValues = zod.infer<typeof expenseFormSchema>;

export default function ExpenseBookPage() {
  const [query, setQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [catFilter, setCatFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch expenses
  const {
    data: expenseData,
    isLoading,
    refetch,
  } = useExpenses({
    q: query || undefined,
    categoryId: catFilter === 'ALL' ? undefined : catFilter,
    paymentMethod: methodFilter === 'ALL' ? undefined : methodFilter,
    page: currentPage,
    limit: 15,
  });

  const createMutation = useCreateExpense();

  // Retrieve EXPENSE accounts
  const { data: accountsData } = useAccounts({ type: 'EXPENSE' });
  const expenseAccounts = accountsData?.data || [];

  const expenses = expenseData?.data || [];
  const meta = expenseData?.meta;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      accountId: '',
      amount: 0,
      paymentMethod: 'CASH',
      reference: '',
      date: new Date().toISOString().substring(0, 10),
      notes: '',
    },
  });

  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      setIsCreateOpen(false);
      reset();
      void refetch();
    } catch {}
  };

  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  return (
    <PageContainer className="text-slate-100 select-none text-left">
      {/* Action header bar */}
      <div className="mb-4 flex justify-between items-center">
        <Link href="/accounting">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1.5 h-8"
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
          <span>Record Expense</span>
        </Button>
      </div>

      <PageHeader
        title="Expense Book Ledger"
        description="Monitor operating expenses, track payouts to vendors, and verify budget line deductions."
      />

      {/* Toolbar filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4 mb-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search reference or memo..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 bg-slate-950 border-slate-800 text-slate-100 text-xs focus-visible:ring-emerald-500 h-9"
            />
          </div>

          {/* Category Filter */}
          <select
            value={catFilter}
            onChange={(e) => {
              setCatFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0c1220] border border-slate-850 text-slate-350 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[140px]"
          >
            <option value="ALL">All Categories</option>
            {expenseAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0c1220] border border-slate-850 text-slate-350 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[120px]"
          >
            <option value="ALL">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="BANK">Bank Transfer</option>
            <option value="CARD">Card Payment</option>
            <option value="MOBILE">Mobile Money</option>
          </select>
        </div>
      </div>

      {/* Expenses table list */}
      <div className="space-y-4">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : expenses.length > 0 ? (
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-855 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-955/35">
                  <th className="py-3 px-4 font-mono">Date</th>
                  <th className="py-3 px-3 font-mono">Reference</th>
                  <th className="py-3 px-4">Expense Category</th>
                  <th className="py-3 px-4">Description Memo</th>
                  <th className="py-3 px-3 text-center">Method</th>
                  <th className="py-3 px-4 text-right font-mono">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 font-medium text-slate-350 font-mono">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 text-slate-450">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-bold">{exp.reference}</td>
                    <td className="py-3 px-4 font-sans text-slate-300 font-bold">
                      {exp.accountName}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-left truncate max-w-[200px]">
                      {exp.notes || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-455 text-[10px] font-sans font-bold">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-455">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-850 rounded-xl">
            <p className="text-xs">No expense records logged in this ledger period.</p>
          </div>
        )}
      </div>

      {/* Record Expense Dialog Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#0c1220] border border-slate-800 text-slate-100 max-w-md p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-black uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
              <BadgeMinus className="h-5 w-5 text-rose-455 animate-pulse" />
              <span>Record Operating Expense</span>
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Log miscellaneous cash/bank expense payouts directly to corporate ledger.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm">
            {/* Category selection */}
            <div className="grid gap-1.5 text-left">
              <label className="text-slate-400 font-semibold">Expense Category Account *</label>
              <select
                {...register('accountId')}
                className="bg-slate-950 border border-slate-855 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">-- Select Expense Category --</option>
                {expenseAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>
              {errors.accountId && (
                <p className="text-[10px] text-rose-455">{errors.accountId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div className="grid gap-1.5">
                <label className="text-slate-400 font-semibold font-mono">Amount ($) *</label>
                <Input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="0.00"
                  {...register('amount')}
                  className="bg-slate-950 border-slate-855 text-xs text-slate-100 font-mono focus-visible:ring-emerald-500 h-9"
                />
                {errors.amount && (
                  <p className="text-[10px] text-rose-455 font-mono">{errors.amount.message}</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="grid gap-1.5 text-left">
                <label className="text-slate-400 font-semibold">Payment Method *</label>
                <select
                  {...register('paymentMethod')}
                  className="bg-slate-950 border border-slate-855 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer h-9"
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
                <label className="text-slate-400 font-semibold">Reference *</label>
                <Input
                  type="text"
                  placeholder="Voucher / Bill Reference"
                  {...register('reference')}
                  className="bg-slate-950 border-slate-855 text-xs text-slate-100 focus-visible:ring-emerald-500 h-9"
                />
                {errors.reference && (
                  <p className="text-[10px] text-rose-455">{errors.reference.message}</p>
                )}
              </div>

              {/* Date */}
              <div className="grid gap-1.5 text-left">
                <label className="text-slate-400 font-semibold">Date *</label>
                <Input
                  type="date"
                  required
                  {...register('date')}
                  className="bg-slate-950 border-slate-855 text-xs text-slate-100 focus-visible:ring-emerald-500 h-9"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-1.5 text-left">
              <label className="text-slate-400 font-semibold">Memo Notes</label>
              <textarea
                placeholder="Audit notes or transaction description..."
                {...register('notes')}
                className="w-full bg-slate-950 border border-slate-855 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 h-16 resize-none"
              />
            </div>

            {/* Actions */}
            <DialogFooter className="flex sm:justify-between items-center pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 border-slate-800 text-slate-400 hover:text-slate-200 bg-[#0c1220]"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs"
              >
                {createMutation.isPending ? 'LOGGING...' : 'LOG EXPENSE'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

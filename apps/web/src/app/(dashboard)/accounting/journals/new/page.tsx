'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useCreateJournal, useAccounts } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DebitCreditEntry, type EntryLine } from '@/components/accounting/debit-credit-entry';
import { ArrowLeft, CheckCircle, FileUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const journalFormSchema = zod.object({
  referenceNumber: zod.string().optional(),
  date: zod.string().min(1, 'Transaction date is required.'),
  description: zod.string().min(5, 'Description must be at least 5 characters.'),
  notes: zod.string().optional(),
  attachmentUrl: zod.string().optional(),
});

type JournalFormValues = zod.infer<typeof journalFormSchema>;

export default function POSCreateJournalPage() {
  const router = useRouter();
  const createMutation = useCreateJournal();

  // Retrieve accounts for double entry line rows
  const { data: accData } = useAccounts({ limit: 100 });
  const accounts = accData?.data || [];

  const [lines, setLines] = useState<EntryLine[]>([
    {
      accountId: '',
      accountCode: '',
      accountName: '',
      description: '',
      debitAmount: 0,
      creditAmount: 0,
    },
    {
      accountId: '',
      accountCode: '',
      accountName: '',
      description: '',
      debitAmount: 0,
      creditAmount: 0,
    },
  ]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: {
      referenceNumber: '',
      date: new Date().toISOString().substring(0, 10), // default to today's local date
      description: '',
      notes: '',
      attachmentUrl: '',
    },
  });

  const onSubmit = async (values: JournalFormValues, actionStatus: 'DRAFT' | 'POSTED') => {
    // 1. Double Entry Table Validations
    if (lines.length < 2) {
      toast.error('Double-entry journal requires at least 2 entry lines.');
      return;
    }

    // Every line must have an account
    const hasEmptyAccount = lines.some((l) => !l.accountId);
    if (hasEmptyAccount) {
      toast.error('Please specify ledger accounts for all entry lines.');
      return;
    }

    // Every line must have a value > 0
    const hasZeroValues = lines.some((l) => l.debitAmount === 0 && l.creditAmount === 0);
    if (hasZeroValues) {
      toast.error('All journal lines must have a positive Debit or Credit value.');
      return;
    }

    // Balance check: Debits = Credits
    const totalDebit = lines.reduce((sum, l) => sum + l.debitAmount, 0);
    const totalCredit = lines.reduce((sum, l) => sum + l.creditAmount, 0);

    if (totalDebit !== totalCredit) {
      toast.error(
        `Journal entries must balance. Total Debit ($${totalDebit}) must equal Total Credit ($${totalCredit}).`,
      );
      return;
    }

    try {
      const payload = {
        ...values,
        status: actionStatus,
        lines: lines.map((l) => ({
          accountId: l.accountId,
          accountCode: l.accountCode,
          accountName: l.accountName,
          description: l.description,
          debitAmount: l.debitAmount,
          creditAmount: l.creditAmount,
        })),
      };

      await createMutation.mutateAsync(payload);
      router.push('/accounting/journals');
    } catch {}
  };

  return (
    <PageContainer className="max-w-4xl mx-auto py-6 text-foreground select-none text-left">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/accounting/journals">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Journals</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Create Journal Entry"
        description="Log general adjustments and transfer balances across Chart of Accounts. Live double entry constraints enforced."
      />

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6 mt-6 text-xs sm:text-sm">
        {/* Form Meta Fields */}
        <Card className="bg-cardard border-border text-foreground">
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Reference Number */}
              <div className="grid gap-1.5">
                <label className="text-muted-foreground font-semibold font-mono">Reference Number</label>
                <Input
                  type="text"
                  placeholder="Auto-generated if empty"
                  {...register('referenceNumber')}
                  className="bg-muted border-slate-855 text-xs text-foreground font-mono focus-visible:ring-emerald-500"
                />
              </div>

              {/* Transaction Date */}
              <div className="grid gap-1.5 text-left">
                <label className="text-muted-foreground font-semibold">Transaction Date *</label>
                <Input
                  type="date"
                  required
                  {...register('date')}
                  className="bg-muted border-slate-855 text-xs text-foreground focus-visible:ring-emerald-500"
                />
                {errors.date && <p className="text-[10px] text-rose-455">{errors.date.message}</p>}
              </div>

              {/* Attachment UI Foundation */}
              <div className="grid gap-1.5">
                <label className="text-muted-foreground font-semibold">Attachment Reference</label>
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    placeholder="URL or voucher doc code"
                    {...register('attachmentUrl')}
                    className="bg-muted border-slate-855 text-xs text-foreground pr-10 focus-visible:ring-emerald-500"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => toast.info('File attachment upload is a UI placeholder.')}
                    className="absolute right-0 h-9 w-9 text-muted-foreground hover:text-muted-foreground"
                  >
                    <FileUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-1.5 text-left">
              <label className="text-muted-foreground font-semibold">Description / Purpose *</label>
              <Input
                type="text"
                placeholder="E.g., Monthly inventory valuation adjustment"
                {...register('description')}
                className="bg-muted border-slate-855 text-xs text-foreground focus-visible:ring-emerald-500"
              />
              {errors.description && (
                <p className="text-[10px] text-rose-455">{errors.description.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="grid gap-1.5 text-left">
              <label className="text-muted-foreground font-semibold">Internal Audit Notes</label>
              <textarea
                placeholder="Audit notes or references..."
                {...register('notes')}
                className="w-full bg-muted border border-slate-855 rounded p-2 text-xs text-foreground focus:outline-none focus:border-emerald-500 h-16 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Double Entry Lines Section */}
        <Card className="bg-cardard border-border text-foreground">
          <CardContent className="p-6">
            <DebitCreditEntry value={lines} onChange={setLines} accounts={accounts} />
          </CardContent>
        </Card>

        {/* Submission Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
          <Button
            type="button"
            disabled={createMutation.isPending}
            onClick={handleSubmit((vals) => onSubmit(vals, 'DRAFT'))}
            className="h-10 border border-border bg-cardard hover:bg-accent text-slate-250 font-bold uppercase text-xs tracking-wider"
          >
            <span>Save as Draft</span>
          </Button>

          <Button
            type="button"
            disabled={createMutation.isPending}
            onClick={handleSubmit((vals) => onSubmit(vals, 'POSTED'))}
            className="h-10 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs tracking-wider gap-1.5 px-6"
          >
            <CheckCircle className="h-4.5 w-4.5" />
            <span>Post Ledger Entry</span>
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useJournalDetails, useUpdateJournal, useAccounts } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DebitCreditEntry, type EntryLine } from '@/components/accounting/debit-credit-entry';
import { FormLoading } from '@/components/accounting/accounting-skeletons';
import { ArrowLeft, CheckCircle, FileUp, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const journalFormSchema = zod.object({
  referenceNumber: zod.string().optional(),
  date: zod.string().min(1, 'Transaction date is required.'),
  description: zod.string().min(5, 'Description must be at least 5 characters.'),
  notes: zod.string().optional(),
  attachmentUrl: zod.string().optional(),
});

type JournalFormValues = zod.infer<typeof journalFormSchema>;

export default function EditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { data: journal, isLoading: journalLoading } = useJournalDetails(id);
  const updateMutation = useUpdateJournal();

  // Retrieve accounts
  const { data: accData } = useAccounts({ limit: 100 });
  const accounts = accData?.data || [];

  const [lines, setLines] = useState<EntryLine[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
  });

  // Prepopulate form once details are fetched
  useEffect(() => {
    if (journal) {
      reset({
        referenceNumber: journal.referenceNumber,
        date: new Date(journal.date).toISOString().substring(0, 10),
        description: journal.description,
        notes: journal.notes || '',
        attachmentUrl: journal.attachmentUrl || '',
      });
      setLines(
        journal.lines.map((l) => ({
          id: l.id,
          accountId: l.accountId,
          accountCode: l.accountCode,
          accountName: l.accountName,
          description: l.description || '',
          debitAmount: l.debitAmount,
          creditAmount: l.creditAmount,
        })),
      );
    }
  }, [journal, reset]);

  if (journalLoading) {
    return (
      <PageContainer className="max-w-4xl mx-auto py-6">
        <FormLoading />
      </PageContainer>
    );
  }

  if (!journal) {
    return (
      <PageContainer className="max-w-4xl mx-auto py-12 text-center text-muted-foreground text-xs">
        Journal details could not be loaded.
      </PageContainer>
    );
  }

  // Guard: Edit is restricted to DRAFT status
  if (journal.status !== 'DRAFT') {
    return (
      <PageContainer className="max-w-4xl mx-auto py-12 text-left text-foreground">
        <div className="mb-4">
          <Link href={`/accounting/journals/${id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Details</span>
            </Button>
          </Link>
        </div>
        <div className="p-6 bg-muted border border-border rounded-3xl space-y-4 max-w-lg mx-auto text-center">
          <ShieldAlert className="h-10 w-10 text-rose-455 mx-auto animate-pulse" />
          <h3 className="text-sm font-black font-sans uppercase tracking-wider text-slate-250">
            Edit Action Blocked
          </h3>
          <p className="text-xs text-muted-foreground">
            Only journal entries in{' '}
            <span className="text-amber-400 font-bold uppercase">DRAFT</span> status can be
            modified. This entry is currently in status:{' '}
            <span className="text-emerald-400 font-bold uppercase">{journal.status}</span>.
          </p>
        </div>
      </PageContainer>
    );
  }

  const onSubmit = async (values: JournalFormValues) => {
    if (lines.length < 2) {
      toast.error('Double-entry journal requires at least 2 entry lines.');
      return;
    }

    const hasEmptyAccount = lines.some((l) => !l.accountId);
    if (hasEmptyAccount) {
      toast.error('Please specify ledger accounts for all entry lines.');
      return;
    }

    const hasZeroValues = lines.some((l) => l.debitAmount === 0 && l.creditAmount === 0);
    if (hasZeroValues) {
      toast.error('All journal lines must have a positive Debit or Credit value.');
      return;
    }

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
        lines: lines.map((l) => ({
          id: l.id, // preserve id to update correctly
          accountId: l.accountId,
          accountCode: l.accountCode,
          accountName: l.accountName,
          description: l.description,
          debitAmount: l.debitAmount,
          creditAmount: l.creditAmount,
        })),
      };

      await updateMutation.mutateAsync({ id, payload });
      router.push(`/accounting/journals/${id}`);
    } catch {}
  };

  return (
    <PageContainer className="max-w-4xl mx-auto py-6 text-foreground select-none text-left">
      {/* Back button */}
      <div className="mb-4">
        <Link href={`/accounting/journals/${id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Details</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Edit Journal Entry"
        description="Modify details and re-align double-entry lines for this DRAFT transaction."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6 text-xs sm:text-sm">
        {/* Form Meta Fields */}
        <Card className="bg-card border-border text-foreground">
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Reference Number */}
              <div className="grid gap-1.5">
                <label className="text-muted-foreground font-semibold font-mono">
                  Reference Number
                </label>
                <Input
                  type="text"
                  disabled
                  {...register('referenceNumber')}
                  className="bg-muted/60 border-slate-855 text-xs text-muted-foreground font-mono"
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

              {/* Attachment URL */}
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
        <Card className="bg-card border-border text-foreground">
          <CardContent className="p-6">
            <DebitCreditEntry value={lines} onChange={setLines} accounts={accounts} />
          </CardContent>
        </Card>

        {/* Submission Actions */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="h-10 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs tracking-wider gap-1.5 px-6"
          >
            <CheckCircle className="h-4.5 w-4.5" />
            <span>{updateMutation.isPending ? 'SAVING...' : 'SAVE JOURNAL CHANGES'}</span>
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useJournalDetails,
  useApproveJournal,
  usePostJournal,
  useCancelJournal,
  useReverseJournal,
} from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormLoading } from '@/components/accounting/accounting-skeletons';
import {
  ArrowLeft,
  Printer,
  BadgeCheck,
  Building,
  XCircle,
  RefreshCcw,
  Edit,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

export default function JournalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { data: journal, isLoading, refetch } = useJournalDetails(id);

  const approveMutation = useApproveJournal();
  const postMutation = usePostJournal();
  const cancelMutation = useCancelJournal();
  const reverseMutation = useReverseJournal();

  if (isLoading) {
    return (
      <PageContainer className="max-w-4xl mx-auto py-6">
        <FormLoading />
      </PageContainer>
    );
  }

  if (!journal) {
    return (
      <PageContainer className="max-w-4xl mx-auto py-12 text-center text-muted-foreground text-xs">
        Journal entry details could not be found.
      </PageContainer>
    );
  }

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  const handlePost = async () => {
    try {
      await postMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  const handleReverse = async () => {
    const confirm = window.confirm(
      'Are you sure you want to REVERSE this posted journal entry? This will generate a new posted journal reversing all debits/credits.',
    );
    if (confirm) {
      try {
        await reverseMutation.mutateAsync(id);
        router.push('/accounting/journals');
      } catch {}
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalDebit = journal.lines.reduce((sum, l) => sum + (l.debitAmount || 0), 0);
  const totalCredit = journal.lines.reduce((sum, l) => sum + (l.creditAmount || 0), 0);

  return (
    <PageContainer className="max-w-4xl mx-auto py-6 text-foreground select-none text-left print:p-0 print:bg-white print:text-black">
      {/* Back & Action bar (Hidden on Print) */}
      <div className="mb-4 flex justify-between items-center print:hidden">
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

        <div className="flex gap-2">
          {journal.status === 'DRAFT' && (
            <>
              <Link href={`/accounting/journals/${id}/edit`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-border bg-cardard hover:bg-accent text-xs gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="h-8 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs gap-1"
              >
                <BadgeCheck className="h-4 w-4" />
                <span>Approve</span>
              </Button>
            </>
          )}

          {(journal.status === 'DRAFT' || journal.status === 'APPROVED') && (
            <Button
              size="sm"
              onClick={handlePost}
              disabled={postMutation.isPending}
              className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1"
            >
              <Building className="h-4 w-4" />
              <span>Post ledgers</span>
            </Button>
          )}

          {journal.status === 'POSTED' && (
            <Button
              size="sm"
              onClick={handleReverse}
              disabled={reverseMutation.isPending}
              className="h-8 border-rose-900/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 font-bold text-xs gap-1"
            >
              <RefreshCcw className="h-3.5 w-3.5 animate-spin-slow" />
              <span>Reverse Entry</span>
            </Button>
          )}

          {journal.status !== 'POSTED' && journal.status !== 'CANCELLED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="h-8 border-border text-rose-455 bg-cardard hover:bg-accent text-xs gap-1"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={handlePrint}
            className="h-8 bg-muted border border-border text-foreground hover:text-foreground text-xs gap-1"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Layout</span>
          </Button>
        </div>
      </div>

      <PageHeader
        title={`Journal Entry Details`}
        description={`Audit review sheet for transaction reference: ${journal.referenceNumber}`}
        className="print:hidden"
      />

      {/* Clean printable stylesheet style wrapper */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          #sidebar,
          header,
          footer,
          .print\\:hidden {
            display: none !important;
          }
          .print-border-black {
            border-color: #000000 !important;
            border-width: 1px !important;
          }
          .print-text-black {
            color: #000000 !important;
          }
        }
      `}</style>

      {/* Main details body */}
      <div className="mt-6 space-y-6 print:m-0 print:border print:p-8 print-border-black rounded-3xl overflow-hidden bg-cardard border border-border text-foreground print:bg-white print:text-black">
        <div className="p-6 space-y-6">
          {/* Header invoice details */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-border pb-6 print:border-black">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest print:text-black/60">
                Enterprise Journal Entry
              </span>
              <h2 className="text-xl font-black font-mono text-foreground print:text-black">
                {journal.referenceNumber}
              </h2>
              <p className="text-xs text-muted-foreground print:text-black/80">{journal.description}</p>
            </div>

            <div className="space-y-1 sm:text-right text-[11px] font-mono text-muted-foreground print:text-black">
              <p>
                <span className="font-sans text-muted-foreground">Date:</span>{' '}
                {new Date(journal.date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-sans text-muted-foreground">Status:</span>{' '}
                <span className="font-sans uppercase font-bold text-indigo-400 print:text-black">
                  {journal.status}
                </span>
              </p>
              {journal.attachmentUrl && (
                <p>
                  <span className="font-sans text-muted-foreground">Attachment:</span>{' '}
                  <span className="truncate max-w-[120px] inline-block align-bottom">
                    {journal.attachmentUrl}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Lines Table */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 print:text-black">
              <ClipboardList className="h-4 w-4" />
              <span>Journal Entries Breakdown</span>
            </h3>

            <div className="border border-border rounded-xl overflow-hidden print:border-black">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-855 text-muted-foreground font-bold uppercase tracking-wider text-[10px] bg-slate-955/35 print:border-black print:text-black print:bg-slate-100">
                    <th className="py-2.5 px-4">Account Code</th>
                    <th className="py-2.5 px-3">Account Name</th>
                    <th className="py-2.5 px-4">Line Notes</th>
                    <th className="py-2.5 px-3 text-right font-mono">Debit ($)</th>
                    <th className="py-2.5 px-3 text-right font-mono">Credit ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium text-foreground font-mono print:divide-black/20 print:text-black">
                  {journal.lines.map((l, idx) => (
                    <tr key={l.id || idx} className="hover:bg-accent/10">
                      <td className="py-3 px-4 text-muted-foreground print:text-black font-bold">
                        {l.accountCode}
                      </td>
                      <td className="py-3 px-3 font-sans text-foreground print:text-black font-bold">
                        {l.accountName}
                      </td>
                      <td className="py-3 px-4 font-sans text-muted-foreground print:text-black/80">
                        {l.description || '-'}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 print:text-black font-bold">
                        {l.debitAmount > 0 ? `$${l.debitAmount.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-455 print:text-black font-bold">
                        {l.creditAmount > 0 ? `$${l.creditAmount.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-955/25 font-black border-t border-slate-855 font-mono text-foreground print:border-black print:text-black print:bg-slate-100">
                    <td
                      colSpan={3}
                      className="py-3 px-4 font-sans text-right uppercase tracking-wider text-muted-foreground print:text-black"
                    >
                      Total:
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 print:text-black">
                      ${totalDebit.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-455 print:text-black">
                      ${totalCredit.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes summary details */}
          {journal.notes && (
            <div className="border-t border-border pt-4 text-xs space-y-1.5 print:border-black print:text-black">
              <span className="font-bold text-muted-foreground block print:text-black">Audit Notes</span>
              <p className="p-3 bg-muted rounded-lg text-muted-foreground print:bg-slate-50 print:border print:text-black">
                {journal.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

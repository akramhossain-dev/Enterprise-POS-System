'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useClosingChecklist,
  useCheckoffChecklistItem,
  useRunClosing,
  useFiscalYears,
} from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ClosingChecklist } from '@/components/accounting/closing-checklist';
import { TableSkeleton } from '@/components/accounting/accounting-skeletons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountingClosingPage() {
  const [selectedPeriodId, setSelectedPeriodId] = useState('p-3'); // default mock period is p-3 (July 2026)

  // Fetch fiscal year data to list period choices
  const { data: years = [] } = useFiscalYears();
  const activeYear = years[0];
  const periods = activeYear?.periods || [];

  // Fetch closing checklist for selected period
  const { data: checklistItems = [], isLoading } = useClosingChecklist(selectedPeriodId);

  const checkoffMutation = useCheckoffChecklistItem();
  const closeMutation = useRunClosing();

  const activePeriod = periods.find((p) => p.id === selectedPeriodId) || {
    name: 'July 2026',
    status: 'OPEN',
  };

  const handleCheckoff = async (itemId: string) => {
    try {
      await checkoffMutation.mutateAsync({
        periodId: selectedPeriodId,
        itemId,
      });
    } catch {}
  };

  const handleRunClosing = async () => {
    const confirm = window.confirm(
      `Freeze all ledgers and run the Closing Procedure for ${activePeriod.name}? This action is permanent.`,
    );
    if (confirm) {
      try {
        await closeMutation.mutateAsync(selectedPeriodId);
        toast.success(`Period ${activePeriod.name} successfully closed and archived.`);
      } catch {}
    }
  };

  return (
    <PageContainer className="text-slate-100 select-none text-left">
      {/* Navigation bar */}
      <div className="mb-4">
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
      </div>

      <PageHeader
        title="Accounting Period Closing"
        description="Verify month-end adjustments, complete closing checklist tasks, and authorize ledger freezes."
      />

      {/* Select active period */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4 mb-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="bg-[#0c1220] border border-slate-855 text-slate-350 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[200px] font-bold"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: checklist tasks */}
        <div className="md:col-span-2">
          {isLoading ? (
            <TableSkeleton rows={5} cols={2} />
          ) : (
            <ClosingChecklist
              items={checklistItems}
              onCheckoff={handleCheckoff}
              onExecuteClosing={handleRunClosing}
              isCheckoffPending={checkoffMutation.isPending}
              isClosingPending={closeMutation.isPending}
              periodName={activePeriod.name}
              isClosed={activePeriod.status === 'CLOSED' || activePeriod.status === 'LOCKED'}
            />
          )}
        </div>

        {/* Right Column: details info */}
        <div className="md:col-span-1">
          <Card className="bg-[#0c1220] border-slate-800 text-slate-100 p-4 space-y-4">
            <div className="border-b border-slate-900 pb-2">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-sans flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-indigo-400" />
                <span>Period Closing Details</span>
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-400 text-left font-sans">
              <p>
                The closing checklist helps controllers ensure ledger integrity before locking
                period books:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-450">
                <li>Check petty cash float reconciliations.</li>
                <li>Audit POS payments against central accounts.</li>
                <li>Double check draft journals are finalized.</li>
                <li>Validate Trial Balance equals zero.</li>
              </ul>
              <p className="text-[10px] text-slate-500 italic">
                Closing authorization records audit trail details with signature metrics.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

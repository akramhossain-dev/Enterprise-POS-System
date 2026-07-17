'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useFiscalYears, useCreateFiscalYear, useTogglePeriodState } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiscalCalendar } from '@/components/accounting/fiscal-calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, CalendarRange, Info } from 'lucide-react';

const fiscalYearSchema = zod.object({
  year: zod.coerce.number().min(2020, 'Year must be 2020 or later.').max(2050, 'Max year is 2050.'),
});

type FiscalYearFormValues = zod.infer<typeof fiscalYearSchema>;

export default function FiscalPeriodsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: years = [], refetch } = useFiscalYears();
  const createMutation = useCreateFiscalYear();
  const toggleMutation = useTogglePeriodState();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FiscalYearFormValues>({
    resolver: zodResolver(fiscalYearSchema),
    defaultValues: {
      year: new Date().getFullYear(),
    },
  });

  const onSubmit = async (values: FiscalYearFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      setIsCreateOpen(false);
      reset();
      void refetch();
    } catch {}
  };

  const handleToggleStatus = async (periodId: string, newStatus: 'OPEN' | 'CLOSED' | 'LOCKED') => {
    const activeYear = years[0]; // operate on the current active year
    if (!activeYear) return;

    const confirm = window.confirm(`Update period state to ${newStatus}?`);
    if (confirm) {
      try {
        await toggleMutation.mutateAsync({
          yearId: activeYear.id,
          periodId,
          status: newStatus,
        });
        void refetch();
      } catch {}
    }
  };

  return (
    <PageContainer className="text-foreground select-none text-left">
      {/* Navigation and actions bar */}
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
          <span>New Fiscal Year</span>
        </Button>
      </div>

      <PageHeader
        title="Fiscal Periods & Calendars"
        description="Open/close quarterly accounting periods, freeze operating month logs, and monitor lock state history."
      />

      {/* Info Banner */}
      <div className="my-6 p-4 bg-muted border border-border rounded-2xl flex items-start gap-3 max-w-3xl">
        <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-slate-450 leading-relaxed text-left">
          <p className="font-bold text-foreground">Period Locking Instructions:</p>
          <p>
            Closing a period freezes entries from POS checkouts and payment vouchers. To adjust
            books in a closed period, it must first be re-opened by an Administrator.
            Freezing/locking a period makes ledger entries completely permanent.
          </p>
        </div>
      </div>

      {/* Fiscal Calendars grid */}
      <div className="space-y-6">
        {years.length > 0 ? (
          years.map((year) => (
            <FiscalCalendar
              key={year.id}
              year={year}
              onToggleStatus={handleToggleStatus}
              isPending={toggleMutation.isPending}
            />
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground text-xs">
            No active fiscal years defined. Click &quot;New Fiscal Year&quot; above to start.
          </div>
        )}
      </div>

      {/* New Fiscal Year Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-cardard border border-border text-foreground max-w-md p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-black uppercase text-foreground tracking-wider flex items-center gap-1.5 font-sans">
              <CalendarRange className="h-5 w-5 text-indigo-400" />
              <span>Initialize Fiscal Year</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Initialize calendar parameters and start period locks.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm">
            {/* Year Input */}
            <div className="grid gap-1.5 text-left">
              <label className="text-muted-foreground font-semibold font-mono">Fiscal Year *</label>
              <Input
                type="number"
                placeholder="2026"
                {...register('year')}
                className="bg-muted border-slate-855 text-xs text-foreground font-mono focus-visible:ring-emerald-500"
              />
              {errors.year && (
                <p className="text-[10px] text-rose-455 font-mono">{errors.year.message}</p>
              )}
            </div>

            {/* Actions */}
            <DialogFooter className="flex sm:justify-between items-center pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 border-border text-muted-foreground hover:text-foreground bg-cardard"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs"
              >
                {createMutation.isPending ? 'INITIALIZING...' : 'OPEN FISCAL YEAR'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { Calendar, Lock, Unlock, ShieldAlert } from 'lucide-react';
import type { FiscalYear, AccountingPeriod } from '@/types/accounting';

interface FiscalCalendarProps {
  year: FiscalYear;
  onToggleStatus: (periodId: string, newStatus: 'OPEN' | 'CLOSED' | 'LOCKED') => void;
  isPending?: boolean;
}

export function FiscalCalendar({ year, onToggleStatus, isPending = false }: FiscalCalendarProps) {
  const getStatusBadge = (status: AccountingPeriod['status']) => {
    switch (status) {
      case 'OPEN':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CLOSED':
        return 'bg-rose-500/10 text-rose-455 border-rose-500/20';
      case 'LOCKED':
        return 'bg-slate-900 text-slate-500 border-slate-800';
    }
  };

  return (
    <Card className="bg-[#0c1220] border-slate-800 text-slate-100 select-none text-left">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-sans flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Fiscal Year Calendar {year.year}</span>
            </span>
            <p className="text-[9px] text-slate-500 font-mono">
              Start: {year.startDate} | End: {year.endDate}
            </p>
          </div>
          <span
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
              year.status === 'OPEN'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-455',
            )}
          >
            {year.status}
          </span>
        </div>

        {/* Periods Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {year.periods.map((period) => (
            <div
              key={period.id}
              className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between"
            >
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-bold text-slate-200 font-sans">{period.name}</p>
                <span className="font-mono text-[9px] text-slate-500 block">
                  {period.startDate} to {period.endDate}
                </span>
                <span
                  className={cn(
                    'inline-block px-1.5 py-0.5 rounded text-[8px] font-bold font-sans border uppercase mt-1',
                    getStatusBadge(period.status),
                  )}
                >
                  {period.status}
                </span>
              </div>

              {/* Status togglers */}
              <div className="flex items-center gap-1.5">
                {period.status === 'OPEN' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => onToggleStatus(period.id, 'CLOSED')}
                    className="h-7 w-7 text-slate-500 hover:text-rose-455 hover:bg-rose-500/10"
                    title="Close Period"
                  >
                    <Lock className="h-3.5 w-3.5" />
                  </Button>
                )}
                {period.status === 'CLOSED' && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => onToggleStatus(period.id, 'OPEN')}
                      className="h-7 w-7 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                      title="Reopen Period"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => onToggleStatus(period.id, 'LOCKED')}
                      className="h-7 w-7 text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                      title="Lock Period (Freeze)"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                {period.status === 'LOCKED' && (
                  <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider px-1">
                    LOCKED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

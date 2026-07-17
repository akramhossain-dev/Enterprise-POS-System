'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { FileCheck, ShieldAlert, UserCheck } from 'lucide-react';
import type { ClosingChecklistItem } from '@/types/accounting';

interface ClosingChecklistProps {
  items: ClosingChecklistItem[];
  onCheckoff: (itemId: string) => void;
  onExecuteClosing: () => void;
  isClosingPending?: boolean;
  isCheckoffPending?: boolean;
  periodName: string;
  isClosed?: boolean;
}

export function ClosingChecklist({
  items,
  onCheckoff,
  onExecuteClosing,
  isClosingPending = false,
  isCheckoffPending = false,
  periodName,
  isClosed = false,
}: ClosingChecklistProps) {
  const allChecked = items.length > 0 && items.every((i) => i.checked);

  return (
    <Card className="bg-card border-border text-foreground select-none text-left">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black uppercase text-foreground tracking-wider flex items-center gap-1.5 font-sans">
              <FileCheck className="h-5 w-5 text-indigo-400" />
              <span>Closing Operations Checklist</span>
            </h3>
            <p className="text-xs text-muted-foreground font-mono">Period: {periodName}</p>
          </div>

          <div
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-bold font-sans uppercase tracking-wide',
              isClosed
                ? 'bg-rose-500/10 text-rose-455'
                : allChecked
                  ? 'bg-emerald-500/10 text-emerald-400 animate-pulse'
                  : 'bg-amber-500/10 text-amber-400',
            )}
          >
            {isClosed ? 'Closed period' : allChecked ? 'Checks Balanced' : 'Outstanding checks'}
          </div>
        </div>

        {/* Checklist Rows */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'p-3 border rounded-xl flex items-start gap-3 transition-colors',
                item.checked
                  ? 'border-emerald-500/25 bg-emerald-500/[0.02]'
                  : 'border-border bg-muted/20 hover:border-border',
              )}
            >
              <input
                type="checkbox"
                id={item.id}
                checked={item.checked}
                disabled={isClosed || isCheckoffPending}
                onChange={() => onCheckoff(item.id)}
                className="mt-1 h-3.5 w-3.5 border-slate-700 accent-emerald-500 rounded cursor-pointer shrink-0"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor={item.id}
                  className={cn(
                    'text-xs font-bold font-sans block cursor-pointer transition-colors',
                    item.checked ? 'text-emerald-400' : 'text-foreground',
                  )}
                >
                  {item.task}
                </label>
                <p className="text-[10px] text-slate-450 leading-relaxed">{item.description}</p>
                {item.checked && item.checkedBy && (
                  <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-mono pt-1">
                    <UserCheck className="h-3 w-3" />
                    <span>
                      Checked by {item.checkedBy} on {new Date(item.checkedAt!).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Panel */}
        {isClosed ? (
          <div className="p-4 bg-muted border border-border rounded-xl text-center space-y-2 max-w-md mx-auto">
            <ShieldAlert className="h-8 w-8 text-rose-455 mx-auto animate-pulse" />
            <h4 className="text-xs font-bold text-foreground uppercase font-sans tracking-wide">
              Period Settle Complete
            </h4>
            <p className="text-[10px] text-muted-foreground">
              This accounting period is locked. All adjusting journals are posted, ledgers are
              frozen, and new transactions cannot be recorded.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-2">
            {!allChecked && (
              <p className="text-[10px] text-amber-400/90 text-center font-sans">
                ⚠️ All reconciliation check points must be completed before ledger freezing.
              </p>
            )}
            <Button
              type="button"
              disabled={!allChecked || isClosingPending}
              onClick={onExecuteClosing}
              className={cn(
                'w-full h-10 font-bold uppercase text-xs tracking-wider gap-1.5',
                allChecked
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                  : 'bg-accent border border-border text-muted-foreground cursor-not-allowed',
              )}
            >
              <span>{isClosingPending ? 'EXECUTING LOCK...' : 'EXECUTE PERIOD CLOSING'}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

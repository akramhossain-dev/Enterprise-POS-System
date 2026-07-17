'use client';

import * as React from 'react';
import { CheckCircle2, Clock, XCircle, FileSpreadsheet, HelpCircle, Receipt } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TimelineStep {
  title: string;
  description: string;
  date?: string | Date | null;
  status: 'upcoming' | 'current' | 'completed' | 'failed';
}

interface ReceivingTimelineProps {
  status: string;
  hasInvoice?: boolean;
  isMatched?: boolean;
  receiveDate?: string | Date;
  invoiceDate?: string | Date;
  className?: string;
}

export function ReceivingTimeline({
  status,
  hasInvoice = false,
  isMatched = false,
  receiveDate,
  invoiceDate,
  className,
}: ReceivingTimelineProps) {
  const steps = React.useMemo<TimelineStep[]>(() => {
    const s = status.toUpperCase();

    const result: TimelineStep[] = [
      {
        title: 'Purchase Order Placed',
        description: 'Vendor agreement signed',
        status: 'completed',
      },
    ];

    // Goods receive step
    if (s === 'DRAFT') {
      result.push({
        title: 'Goods Arrived (GRN Draft)',
        description: 'Verifying cargo specifications',
        date: receiveDate,
        status: 'current',
      });
      result.push({
        title: 'Inbound Committed',
        description: 'Waiting for stock confirmation',
        status: 'upcoming',
      });
      result.push({
        title: 'Invoice Audited',
        description: 'Waiting for vendor invoice mapping',
        status: 'upcoming',
      });
    } else if (s === 'CANCELLED') {
      result.push({
        title: 'Goods Receive Aborted',
        description: 'GRN has been cancelled',
        date: receiveDate,
        status: 'failed',
      });
    } else if (s === 'COMPLETED') {
      result.push({
        title: 'Goods Received (GRN Complete)',
        description: 'Items confirmed and added to stock',
        date: receiveDate,
        status: 'completed',
      });

      // Invoice step
      if (!hasInvoice) {
        result.push({
          title: 'Invoice Draft Registered',
          description: 'Awaiting supplier invoice submission',
          status: 'current',
        });
        result.push({
          title: '3-Way Match Verification',
          description: 'Reconciling PO, GRN, and Supplier Invoice values',
          status: 'upcoming',
        });
      } else {
        result.push({
          title: 'Supplier Invoice Audited',
          description: 'Invoice registered successfully',
          date: invoiceDate,
          status: 'completed',
        });

        if (isMatched) {
          result.push({
            title: '3-Way Match Verified',
            description: 'Quantities and prices reconciled. Zero variances.',
            status: 'completed',
          });
        } else {
          result.push({
            title: 'Variance Discrepancy Found',
            description: 'Pricing or quantity variance flagged for review.',
            status: 'failed',
          });
        }
      }
    }

    return result;
  }, [status, hasInvoice, isMatched, receiveDate, invoiceDate]);

  return (
    <div className={cn('bg-cardard border rounded-xl p-6 shadow-sm text-sm', className)}>
      <h3 className="font-semibold text-sm border-b pb-2 text-foreground uppercase tracking-wider mb-5 flex items-center gap-1.5">
        <Receipt className="w-4 h-4 text-primary" /> Processing Timeline
      </h3>
      <div className="relative border-l border-border pl-6 space-y-6">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isFailed = step.status === 'failed';

          return (
            <div key={idx} className="relative">
              <span className="absolute -left-[35px] top-0 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-cardard border shadow-sm">
                {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {isCurrent && <Clock className="h-4 w-4 text-amber-500 animate-spin" />}
                {isFailed && <XCircle className="h-4 w-4 text-rose-500" />}
                {step.status === 'upcoming' && (
                  <Clock className="h-4 w-4 text-muted-foreground/35" />
                )}
              </span>

              <div className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    'text-xs font-bold',
                    isCompleted && 'text-foreground',
                    isCurrent && 'text-amber-500',
                    isFailed && 'text-rose-500',
                    step.status === 'upcoming' && 'text-muted-foreground/50',
                  )}
                >
                  {step.title}
                </span>
                <span className="text-[11px] text-muted-foreground">{step.description}</span>
                {step.date && (
                  <span className="text-[9px] text-muted-foreground/60 mt-1">
                    {new Date(step.date).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

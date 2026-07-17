'use client';

import * as React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ApprovalTimelineItem, PurchaseReturnStatus } from '@/types/purchase-return';

interface TimelineStep {
  title: string;
  description: string;
  date?: string | Date | null;
  status: 'upcoming' | 'current' | 'completed' | 'failed';
}

interface ReturnsApprovalTimelineProps {
  status: PurchaseReturnStatus;
  timeline: ApprovalTimelineItem[];
  className?: string;
}

export function ReturnsApprovalTimeline({
  status,
  timeline,
  className,
}: ReturnsApprovalTimelineProps) {
  const steps = React.useMemo<TimelineStep[]>(() => {
    const result: TimelineStep[] = [];

    // Find entries in the timeline log
    const draftLog = timeline.find((t) => t.status === 'DRAFT');
    const pendingLog = timeline.find((t) => t.status === 'PENDING');
    const approvedLog = timeline.find((t) => t.status === 'APPROVED');
    const rejectedLog = timeline.find((t) => t.status === 'REJECTED');
    const cancelledLog = timeline.find((t) => t.status === 'CANCELLED');
    const completedLog = timeline.find((t) => t.status === 'COMPLETED');

    // 1. Draft step
    result.push({
      title: 'Draft Request Created',
      description: draftLog?.notes || 'Return details populated and saved.',
      date: draftLog?.actionDate,
      status: 'completed',
    });

    // 2. Submission step
    if (pendingLog || approvedLog || rejectedLog || completedLog) {
      result.push({
        title: 'Submitted for Approvals',
        description: pendingLog?.notes || 'Sent to management queue.',
        date: pendingLog?.actionDate || approvedLog?.actionDate,
        status: 'completed',
      });
    } else if (status === 'DRAFT') {
      result.push({
        title: 'Submit Return Request',
        description: 'Needs operator validation and submission.',
        status: 'upcoming',
      });
    } else {
      result.push({
        title: 'Submit Return Request',
        description: 'Submission pending.',
        status: 'current',
      });
    }

    // 3. Manager Approval step
    if (approvedLog) {
      result.push({
        title: 'Request Approved',
        description: approvedLog.notes || 'Management signed authorization voucher.',
        date: approvedLog.actionDate,
        status: 'completed',
      });
    } else if (rejectedLog) {
      result.push({
        title: 'Request Rejected',
        description: rejectedLog.notes || 'Denied by management auditors.',
        date: rejectedLog.actionDate,
        status: 'failed',
      });
    } else if (status === 'PENDING') {
      result.push({
        title: 'Management Audit',
        description: 'Awaiting manager approval and validation.',
        status: 'current',
      });
    } else if (status === 'DRAFT') {
      result.push({
        title: 'Management Audit',
        description: 'Pending workflow validation.',
        status: 'upcoming',
      });
    }

    // 4. Logistics Execution step
    if (completedLog) {
      result.push({
        title: 'Return Completed',
        description: completedLog.notes || 'Items returned, credit note / refund settled.',
        date: completedLog.actionDate,
        status: 'completed',
      });
    } else if (cancelledLog) {
      result.push({
        title: 'Request Cancelled',
        description: cancelledLog.notes || 'Process cancelled and aborted.',
        date: cancelledLog.actionDate,
        status: 'failed',
      });
    } else if (status === 'APPROVED') {
      result.push({
        title: 'Return Fulfillment',
        description: 'Pack products, dispatch shipment, issue credit/debit adjustments.',
        status: 'current',
      });
    } else {
      result.push({
        title: 'Return Fulfillment & Closure',
        description: 'Final reconciliation step.',
        status: 'upcoming',
      });
    }

    return result;
  }, [status, timeline]);

  return (
    <div className={cn('bg-card border rounded-xl p-6 shadow-sm', className)}>
      <h3 className="font-semibold text-sm border-b pb-2 text-foreground uppercase tracking-wider mb-5">
        Return Approval Timeline
      </h3>
      <div className="relative border-l border-border pl-6 space-y-6">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isFailed = step.status === 'failed';

          return (
            <div key={idx} className="relative">
              {/* Timeline circle icon */}
              <span className="absolute -left-[35px] top-0 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-card border shadow-sm">
                {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {isCurrent && <Clock className="h-4 w-4 text-amber-500 animate-spin" />}
                {isFailed && <XCircle className="h-4 w-4 text-rose-500" />}
                {step.status === 'upcoming' && (
                  <AlertCircle className="h-4 w-4 text-muted-foreground/45" />
                )}
              </span>

              <div className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    'text-xs font-bold',
                    isCompleted && 'text-foreground',
                    isCurrent && 'text-amber-500',
                    isFailed && 'text-rose-500',
                    step.status === 'upcoming' && 'text-muted-foreground/60',
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

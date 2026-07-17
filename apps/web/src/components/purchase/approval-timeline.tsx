'use client';

import * as React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TimelineStep {
  title: string;
  description: string;
  date?: string | Date | null;
  status: 'upcoming' | 'current' | 'completed' | 'failed';
}

interface ApprovalTimelineProps {
  status: string;
  createdDate?: string | Date;
  updatedDate?: string | Date;
  creatorId?: string;
  approverId?: string | null;
  className?: string;
}

export function ApprovalTimeline({
  status,
  createdDate,
  updatedDate,
  creatorId = 'Operator',
  approverId,
  className,
}: ApprovalTimelineProps) {
  const steps = React.useMemo<TimelineStep[]>(() => {
    const s = status.toUpperCase();

    const result: TimelineStep[] = [
      {
        title: 'Draft Initiated',
        description: `Created by ${creatorId}`,
        date: createdDate,
        status: 'completed',
      },
    ];

    // Step 2: Submission
    if (s === 'DRAFT') {
      result.push({
        title: 'Submit Order',
        description: 'Awaiting submission for manager review',
        status: 'upcoming',
      });
      result.push({
        title: 'Manager Approval',
        description: 'Pending workflow review',
        status: 'upcoming',
      });
      result.push({
        title: 'Delivery Receipt',
        description: 'Goods confirmation pending',
        status: 'upcoming',
      });
    } else if (s === 'PENDING' || s === 'PENDING_APPROVAL') {
      result.push({
        title: 'Submitted for Review',
        description: 'Awaiting manager signature approval',
        date: updatedDate,
        status: 'completed',
      });
      result.push({
        title: 'Manager Approval',
        description: 'Awaiting approval check',
        status: 'current',
      });
      result.push({
        title: 'Delivery Receipt',
        description: 'Goods confirmation pending',
        status: 'upcoming',
      });
    } else if (s === 'APPROVED') {
      result.push({
        title: 'Submitted for Review',
        description: 'Awaiting manager signature approval',
        date: createdDate,
        status: 'completed',
      });
      result.push({
        title: 'Approved',
        description: `Signed off by ${approverId || 'Manager'}`,
        date: updatedDate,
        status: 'completed',
      });
      result.push({
        title: 'Goods Inbound Delivery',
        description: 'Awaiting shipment receipt',
        status: 'current',
      });
    } else if (s === 'REJECTED') {
      result.push({
        title: 'Submitted for Review',
        description: 'Awaiting manager signature approval',
        date: createdDate,
        status: 'completed',
      });
      result.push({
        title: 'Rejected',
        description: `Denied by ${approverId || 'Manager'}`,
        date: updatedDate,
        status: 'failed',
      });
    } else if (s === 'CANCELLED') {
      result.push({
        title: 'Cancelled',
        description: 'Procurement route aborted',
        date: updatedDate,
        status: 'failed',
      });
    } else if (s === 'COMPLETED' || s === 'RECEIVED' || s === 'PARTIALLY_RECEIVED') {
      result.push({
        title: 'Submitted for Review',
        description: 'Awaiting manager signature approval',
        date: createdDate,
        status: 'completed',
      });
      result.push({
        title: 'Approved',
        description: `Approved by manager`,
        date: createdDate,
        status: 'completed',
      });
      result.push({
        title: 'Completed',
        description: `Logistics received (${status})`,
        date: updatedDate,
        status: 'completed',
      });
    }

    return result;
  }, [status, createdDate, updatedDate, creatorId, approverId]);

  return (
    <div className={cn('bg-card border rounded-xl p-6 shadow-sm', className)}>
      <h3 className="font-semibold text-sm border-b pb-2 text-foreground uppercase tracking-wider mb-5">
        Procurement Workflow Timeline
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

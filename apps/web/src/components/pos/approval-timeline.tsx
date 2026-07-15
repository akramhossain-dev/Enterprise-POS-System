'use client';

import React from 'react';
import { CheckCircle2, Circle, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ApprovalTimelineProps {
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  refundStatus?: 'PENDING' | 'REFUNDED' | 'FAILED';
}

export function ApprovalTimeline({ status, refundStatus }: ApprovalTimelineProps) {
  const steps = [
    { key: 'DRAFT', label: 'Draft Claim Created' },
    { key: 'SUBMITTED', label: 'Submitted for Review' },
    { key: 'APPROVED', label: 'Supervisors Approval' },
    { key: 'COMPLETED', label: 'Refund Cash Settled' },
  ];

  const getStepIndex = (val: string) => {
    if (val === 'REJECTED') return 1; // Highlight rejection at review step
    const idx = steps.findIndex((s) => s.key === val);
    return idx !== -1 ? idx : 0;
  };

  const currentIdx = getStepIndex(status);

  return (
    <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-5 select-none text-left">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
        Return Approval Pipeline
      </h3>
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
        {/* Horizontal Connecting line (MD screens) */}
        <div className="hidden md:block absolute left-4 right-4 top-[14px] h-[2px] bg-slate-850 z-0" />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIdx || (status === 'COMPLETED' && idx <= currentIdx);
          const isActive = idx === currentIdx;
          const isRejectedStep = status === 'REJECTED' && idx === 2;

          return (
            <div
              key={step.key}
              className="relative flex md:flex-col items-center md:items-center text-left md:text-center z-10 flex-1 w-full gap-3 md:gap-2.5"
            >
              {/* Node Icon */}
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors shrink-0',
                  isRejectedStep
                    ? 'bg-rose-950 border-rose-500 text-rose-455'
                    : isCompleted
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                      : isActive
                        ? 'bg-amber-950 border-amber-500 text-amber-400 animate-pulse'
                        : 'bg-slate-900 border-slate-800 text-slate-500',
                )}
              >
                {isRejectedStep ? (
                  <AlertCircle className="h-4.5 w-4.5" />
                ) : isCompleted ? (
                  <CheckCircle2 className="h-4.5 w-4.5" />
                ) : isActive ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Circle className="h-4 w-4 fill-current opacity-20" />
                )}
              </div>

              {/* Description */}
              <div className="text-left md:text-center">
                <p
                  className={cn(
                    'text-xs font-bold font-mono tracking-wider',
                    isRejectedStep
                      ? 'text-rose-400'
                      : isCompleted
                        ? 'text-emerald-400'
                        : isActive
                          ? 'text-amber-400'
                          : 'text-slate-500',
                  )}
                >
                  {isRejectedStep ? 'Claim Rejected' : step.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {step.key === 'COMPLETED' && refundStatus
                    ? `Settle: ${refundStatus}`
                    : step.key === 'APPROVED' && status === 'APPROVED'
                      ? 'Review Succeeded'
                      : 'System Timestamped'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

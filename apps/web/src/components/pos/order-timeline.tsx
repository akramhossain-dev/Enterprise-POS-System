'use client';

import React from 'react';
import {
  CheckCircle2,
  DollarSign,
  Package,
  RefreshCw,
  XCircle,
  ArrowRightLeft,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface OrderTimelineProps {
  status: 'PAID' | 'VOIDED' | 'PARTIALLY_RETURNED' | 'FULLY_RETURNED';
  completedAt: string;
}

export function OrderTimeline({ status, completedAt }: OrderTimelineProps) {
  const steps = [
    { key: 'PLACED', label: 'Order Placed', icon: Package },
    { key: 'PAID', label: 'Payment Settled', icon: DollarSign },
    { key: 'RETURN', label: 'Returns Check', icon: ArrowRightLeft },
    { key: 'STATUS', label: 'Final State', icon: CheckCircle2 },
  ];

  const getStatusDetails = () => {
    switch (status) {
      case 'VOIDED':
        return {
          label: 'Transaction Voided',
          icon: XCircle,
          color: 'text-rose-450 border-rose-500 bg-rose-950/20',
        };
      case 'FULLY_RETURNED':
        return {
          label: 'Fully Returned',
          icon: ArrowRightLeft,
          color: 'text-rose-400 border-rose-500 bg-rose-950/20',
        };
      case 'PARTIALLY_RETURNED':
        return {
          label: 'Partially Returned',
          icon: ArrowRightLeft,
          color: 'text-amber-400 border-amber-500 bg-amber-950/20',
        };
      default:
        return {
          label: 'Order Complete',
          icon: CheckCircle2,
          color: 'text-emerald-400 border-emerald-500 bg-emerald-950/20',
        };
    }
  };

  const finalDetails = getStatusDetails();

  return (
    <div className="bg-cardard border border-border rounded-2xl p-5 select-none text-left">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
        Order Lifecycle Audit Trail
      </h3>
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
        {/* Connection pipe */}
        <div className="hidden md:block absolute left-4 right-4 top-[14px] h-[2px] bg-slate-850 z-0" />

        {/* Step 1: Placed */}
        <div className="relative flex md:flex-col items-center gap-3 md:gap-2.5 flex-1 z-10 w-full">
          <div className="h-8 w-8 rounded-full flex items-center justify-center border-2 border-emerald-500 bg-emerald-950 text-emerald-450 shrink-0">
            <Package className="h-4 w-4" />
          </div>
          <div className="text-left md:text-center">
            <p className="text-xs font-bold text-emerald-400 font-mono tracking-wider">
              Order Initialized
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(completedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Step 2: Paid */}
        <div className="relative flex md:flex-col items-center gap-3 md:gap-2.5 flex-1 z-10 w-full">
          <div className="h-8 w-8 rounded-full flex items-center justify-center border-2 border-emerald-500 bg-emerald-950 text-emerald-450 shrink-0">
            <DollarSign className="h-4 w-4" />
          </div>
          <div className="text-left md:text-center">
            <p className="text-xs font-bold text-emerald-400 font-mono tracking-wider">
              Settled Paid
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Change Tendered</p>
          </div>
        </div>

        {/* Step 3: Returns */}
        <div className="relative flex md:flex-col items-center gap-3 md:gap-2.5 flex-1 z-10 w-full">
          <div
            className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center border-2 shrink-0',
              status.includes('RETURNED')
                ? 'border-amber-500 bg-amber-950/20 text-amber-400'
                : 'border-border bg-accent text-muted-foreground',
            )}
          >
            <ArrowRightLeft className="h-4 w-4" />
          </div>
          <div className="text-left md:text-center">
            <p
              className={cn(
                'text-xs font-bold font-mono tracking-wider',
                status.includes('RETURNED') ? 'text-amber-400' : 'text-muted-foreground',
              )}
            >
              Returns Registry
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {status.includes('RETURNED') ? 'Goods Retake' : 'No Claims'}
            </p>
          </div>
        </div>

        {/* Step 4: Final Status */}
        <div className="relative flex md:flex-col items-center gap-3 md:gap-2.5 flex-1 z-10 w-full">
          <div
            className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center border-2 shrink-0',
              finalDetails.color,
            )}
          >
            <finalDetails.icon className="h-4 w-4" />
          </div>
          <div className="text-left md:text-center">
            <p
              className={cn(
                'text-xs font-bold font-mono tracking-wider',
                finalDetails.color.split(' ')[0],
              )}
            >
              {finalDetails.label}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Audit complete</p>
          </div>
        </div>
      </div>
    </div>
  );
}

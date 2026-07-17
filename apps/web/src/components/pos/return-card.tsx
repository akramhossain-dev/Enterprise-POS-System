'use client';

import React from 'react';
import type { SalesReturn } from '@/types/sales-return';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ReturnCardProps {
  claim: SalesReturn;
}

export function ReturnCard({ claim }: ReturnCardProps) {
  const getStatusColor = (status: SalesReturn['status']) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-accent border-border text-muted-foreground';
      case 'SUBMITTED':
        return 'bg-amber-950/40 border-amber-900/60 text-amber-400';
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400';
      case 'REJECTED':
        return 'bg-rose-950/40 border-rose-900/60 text-rose-450';
      default:
        return 'bg-accent text-muted-foreground';
    }
  };

  return (
    <Card className="bg-card border-border hover:border-slate-750 transition-all text-foreground text-left">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
            <span className="font-mono font-black text-foreground">{claim.returnNumber}</span>
            <span className="text-[10px] text-muted-foreground">
              Invoice: {claim.invoiceNumber}
            </span>
            <Badge
              className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 uppercase rounded border ${getStatusColor(claim.status)}`}
            >
              {claim.status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(claim.returnDate).toLocaleDateString()}</span>
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{claim.customerName}</span>
            </span>
            <span>•</span>
            <span>Refund Method: {claim.refundMethod}</span>
          </div>

          {claim.notes && (
            <p className="text-[10px] text-muted-foreground bg-muted/40 border border-border rounded p-1.5 mt-2 line-clamp-1">
              Note: {claim.notes}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-wider font-mono">
              Refund Amount
            </span>
            <span className="font-mono font-black text-rose-450 text-base sm:text-lg">
              ${claim.refundAmount.toFixed(2)}
            </span>
          </div>

          <Link href={`/pos/returns/${claim.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-border bg-card hover:bg-accent text-xs"
            >
              <span>View Claim</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

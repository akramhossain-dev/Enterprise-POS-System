'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileWarning, Printer } from 'lucide-react';
import type { SupplierDebitNote } from '@/types/purchase-return';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DebitNoteCardProps {
  debitNote: SupplierDebitNote;
  onPrint?: () => void;
}

export function DebitNoteCard({ debitNote, onPrint }: DebitNoteCardProps) {
  const statusStyles = {
    DRAFT: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    ISSUED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    VOID: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    APPLIED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  return (
    <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden text-sm">
      <CardHeader className="bg-muted/30 border-b p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileWarning className="w-4 h-4 text-amber-500" />
          <span className="font-mono font-bold text-foreground">{debitNote.debitNoteNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusStyles[debitNote.status] || 'bg-muted'}>{debitNote.status}</Badge>
          {onPrint && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onPrint}>
              <Printer className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Supplier vendor</span>
          <span className="font-semibold text-foreground">
            {debitNote.supplier?.companyName || '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Reference return</span>
          <span className="font-mono font-semibold text-primary">
            {debitNote.referenceReturnNumber}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Issue date</span>
          <span className="text-foreground">
            {new Date(debitNote.issueDate).toLocaleDateString()}
          </span>
        </div>
        <div className="border-t border-dashed border-border/80 my-2 pt-2.5 flex justify-between items-baseline">
          <span className="font-semibold text-foreground">Deducted Amount</span>
          <span className="text-lg font-bold font-mono text-amber-500">
            ${Number(debitNote.amount).toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

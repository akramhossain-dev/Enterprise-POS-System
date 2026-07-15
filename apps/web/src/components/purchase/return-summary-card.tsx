'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building2, Warehouse, FileText, Calendar, Paperclip, Clipboard } from 'lucide-react';
import type { PurchaseReturn } from '@/types/purchase-return';

interface ReturnSummaryCardProps {
  purchaseReturn: PurchaseReturn;
}

export function ReturnSummaryCard({ purchaseReturn }: ReturnSummaryCardProps) {
  const getReferenceLabel = () => {
    switch (purchaseReturn.referenceType) {
      case 'PO':
        return `Purchase Order: ${purchaseReturn.referencePoNumber || 'N/A'}`;
      case 'GRN':
        return `Goods Receive (GRN): ${purchaseReturn.referenceGrnNumber || 'N/A'}`;
      case 'INVOICE':
        return `Supplier Invoice: ${purchaseReturn.referenceInvoiceNumber || 'N/A'}`;
      default:
        return 'Standalone Direct Return';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 text-sm">
      {/* Supplier & Warehouse Details */}
      <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/20 border-b p-4">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-primary" /> Supplier & Warehouse
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/15 self-start">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {purchaseReturn.supplier?.companyName || '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                Contact: {purchaseReturn.supplier?.contactPerson || '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                {purchaseReturn.supplier?.email || '—'}
              </p>
            </div>
          </div>

          <div className="border-t border-border/60 my-2 pt-3" />

          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/15 self-start">
              <Warehouse className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {purchaseReturn.warehouse?.name || '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                Code: {purchaseReturn.warehouse?.code || '—'} |{' '}
                {purchaseReturn.warehouse?.city || '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reference & Audit Info */}
      <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/20 border-b p-4">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Clipboard className="w-4 h-4 text-indigo-500" /> Document Reference & Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Return Date:
              </span>
              <span className="font-medium text-foreground">
                {new Date(purchaseReturn.returnDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Reference Type:
              </span>
              <span className="font-semibold text-foreground">{purchaseReturn.referenceType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Reference ID:
              </span>
              <span className="font-mono font-medium text-primary">{getReferenceLabel()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clipboard className="w-3.5 h-3.5" /> Created By:
              </span>
              <span className="text-foreground">{purchaseReturn.createdBy}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Attachments (Full width) */}
      <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden md:col-span-2">
        <CardHeader className="bg-muted/20 border-b p-4">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-muted-foreground" /> Notes & Attachments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-1">
              Return Remarks
            </span>
            <p className="text-foreground bg-muted/40 p-3 rounded-lg border border-border/40 text-xs leading-relaxed italic">
              {purchaseReturn.notes || 'No notes specified.'}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-2">
              Attachments
            </span>
            <div className="flex flex-wrap gap-2">
              {purchaseReturn.attachments && purchaseReturn.attachments.length > 0 ? (
                purchaseReturn.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 border border-border/80 bg-muted/30 hover:bg-muted/50 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    <Paperclip className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground truncate max-w-[150px]">{file}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground/70 bg-muted/25 px-3 py-1.5 rounded-lg border border-dashed">
                  <Paperclip className="w-3 h-3" /> No file attachments.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

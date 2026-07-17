'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRefunds } from '@/hooks/use-sales-return';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Coins, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

export default function POSRefundsHistoryPage() {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch refunds list
  const { data: refundData, isLoading } = useRefunds({
    q: query || undefined,
    page: currentPage,
    limit: 10,
  });

  const refunds = refundData?.data || [];
  const meta = refundData?.meta;

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (meta && currentPage < meta.totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  return (
    <PageContainer className="max-w-6xl mx-auto py-6 text-foreground select-none text-left">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/pos">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to POS Terminal</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Refund Settlements Directory"
        description="Verify cash reversals, gift card refunds, store credits, and cashier refund activities."
      />

      {/* Filter panel */}
      <div className="relative mb-6 mt-4 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search refunds by invoice or customer name..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-8 bg-muted border-border text-foreground text-xs focus-visible:ring-emerald-500 h-9"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground font-medium">
            Retrieving refunds history...
          </div>
        ) : refunds.length > 0 ? (
          refunds.map((refund) => (
            <Card
              key={refund.id}
              className="bg-card border-border hover:border-slate-750 transition-colors"
            >
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="space-y-1.5 text-left flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-bold text-foreground"># {refund.returnNumber}</span>
                    <span className="text-[10px] text-muted-foreground">
                      Invoice: {refund.invoiceNumber}
                    </span>
                    <Badge className="bg-emerald-950/40 text-emerald-400 border-emerald-900/60 font-bold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded">
                      {refund.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{new Date(refund.processedAt).toLocaleString()}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span>Cashier: {refund.cashierName}</span>
                    </span>
                    <span>•</span>
                    <span className="text-muted-foreground font-medium">
                      Customer: {refund.customerName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider font-mono">
                      Refund Amount
                    </span>
                    <span className="font-mono font-black text-rose-455 text-sm sm:text-base">
                      ${refund.amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-[10px] bg-accent border border-border text-muted-foreground px-2 py-1 rounded font-mono shrink-0">
                    {refund.refundMethod}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-slate-855 rounded-xl">
            <Coins className="h-10 w-10 mb-2 text-slate-800 mx-auto" />
            <p className="text-xs">No refund settlements registered.</p>
          </div>
        )}
      </div>

      {/* Pager */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border text-xs text-muted-foreground font-mono">
          <p>
            Page {meta.page} of {meta.totalPages}
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={handlePrevPage}
              className="h-7 w-7 bg-card border-border text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage >= meta.totalPages}
              onClick={handleNextPage}
              className="h-7 w-7 bg-card border-border text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

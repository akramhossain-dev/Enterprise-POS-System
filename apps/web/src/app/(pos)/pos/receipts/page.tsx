'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTransactions } from '@/hooks/use-checkout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Search,
  Calendar,
  Printer,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

export default function POSReceiptsPage() {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch receipts list
  const { data: txData, isLoading } = useTransactions({
    q: query || undefined,
    page: currentPage,
    limit: 10,
  });

  const transactions = txData?.data || [];
  const meta = txData?.meta;

  const handleReprint = (invoiceNumber: string) => {
    toast.success(`Reprint command sent to thermal printer for invoice ${invoiceNumber}`);
  };

  const handleDownload = (id: string) => {
    toast.success(`Downloading PDF receipt for transaction ${id}`);
  };

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
        title="Receipt History & Reprint"
        description="Search past ticket receipts, reprint receipt copies, and download POS thermal PDFs."
      />

      {/* Filter search */}
      <div className="relative mb-6 mt-4 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search receipts by invoice number or customer..."
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
          <div className="text-center py-12 text-muted-foreground">Retrieving receipts...</div>
        ) : transactions.length > 0 ? (
          transactions.map((tx) => (
            <Card
              key={tx.id}
              className="bg-cardard border-border hover:border-slate-750 transition-colors"
            >
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="space-y-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-foreground">{tx.invoiceNumber}</span>
                    <span className="text-[10px] bg-accent border border-border text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                      {tx.cartName}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{new Date(tx.completedAt).toLocaleString()}</span>
                    </span>
                    <span className="text-muted-foreground font-medium">Customer: {tx.customerName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider font-mono">
                      Value
                    </span>
                    <span className="font-mono font-black text-emerald-400 text-sm sm:text-base">
                      ${tx.grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <Link href={`/pos/receipts/${tx.id}`}>
                      <Button
                        size="sm"
                        className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Preview</span>
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleReprint(tx.invoiceNumber)}
                      className="h-8 w-8 border-border hover:bg-accent text-muted-foreground"
                      title="Reprint Receipt"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDownload(tx.id)}
                      className="h-8 w-8 border-border hover:bg-accent text-muted-foreground"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <Printer className="h-10 w-10 mb-2 text-slate-800 mx-auto" />
            <p className="text-xs">No receipt records found.</p>
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
              className="h-7 w-7 bg-cardard border-border text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage >= meta.totalPages}
              onClick={handleNextPage}
              className="h-7 w-7 bg-cardard border-border text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

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
  CreditCard,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

export default function POSPaymentsPage() {
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch payments list
  const { data: txData, isLoading } = useTransactions({
    q: query || undefined,
    method: method === 'ALL' ? undefined : method,
    page: currentPage,
    limit: 10,
  });

  const transactions = txData?.data || [];
  const meta = txData?.meta;

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (meta && currentPage < meta.totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  return (
    <PageContainer className="max-w-6xl mx-auto py-6 text-slate-100 select-none text-left">
      {/* Back navigation */}
      <div className="mb-4">
        <Link href="/pos">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to POS Terminal</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Checkout Payment History"
        description="Verify payments, mixed payment configurations, split cash/cards transactions, and cash change values."
      />

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search payments (Invoice, customer)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8 bg-slate-950 border-slate-800 text-slate-100 text-xs focus-visible:ring-emerald-500 h-9"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0c1220] border border-slate-850 text-slate-300 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[130px]"
          >
            <option value="ALL">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Credit Card</option>
            <option value="MOBILE">Mobile Bank</option>
            <option value="GIFT_CARD">Gift Card</option>
            <option value="STORE_CREDIT">Store Credit</option>
          </select>
        </div>
      </div>

      {/* Grid of payments */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-slate-500">
            Searching transactions log...
          </div>
        ) : transactions.length > 0 ? (
          transactions.map((tx) => (
            <Card
              key={tx.id}
              className="bg-[#0c1220] border-slate-800 hover:border-slate-750 transition-colors"
            >
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs sm:text-sm">
                {/* Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-bold text-slate-200"># {tx.invoiceNumber}</span>
                    <Badge className="bg-emerald-950/40 text-emerald-400 border-emerald-900/60 font-bold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded">
                      {tx.paymentStatus}
                    </Badge>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                      {tx.cartName}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{new Date(tx.completedAt).toLocaleString()}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span>Cashier: {tx.cashierName}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">Customer: {tx.customerName}</span>
                  </div>

                  {/* Payment splits details */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-1 border-t border-slate-900">
                    {tx.payments.map((p, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-950/60 border border-slate-850 px-2 py-0.5 rounded-md font-mono text-slate-300"
                      >
                        {p.method}: ${p.amount.toFixed(2)} {p.reference && `(${p.reference})`}
                      </span>
                    ))}
                    {tx.changeAmount > 0 && (
                      <span className="text-[10px] bg-slate-950/40 border border-slate-850 px-2 py-0.5 rounded-md font-mono text-emerald-400">
                        Cash Change: ${tx.changeAmount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amounts & Preview links */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider font-mono">
                      Grand Total
                    </span>
                    <span className="font-mono font-black text-emerald-400 text-base sm:text-lg">
                      ${tx.grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/pos/receipts/${tx.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-slate-800 bg-[#0c1220] hover:bg-slate-900 text-xs"
                      >
                        Receipt
                      </Button>
                    </Link>
                    <Link href={`/pos/invoices/${tx.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-slate-800 bg-[#0c1220] hover:bg-slate-900 text-xs"
                      >
                        Invoice
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-850 rounded-xl">
            <CreditCard className="h-10 w-10 mb-2 text-slate-800 mx-auto" />
            <p className="text-xs">No transaction records found matching filters.</p>
          </div>
        )}
      </div>

      {/* Pager */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-900 text-xs text-slate-500">
          <p>
            Showing {transactions.length} of {meta.total} transaction records
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={handlePrevPage}
              className="h-7 w-7 bg-[#0c1220] border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono text-slate-400">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage >= meta.totalPages}
              onClick={handleNextPage}
              className="h-7 w-7 bg-[#0c1220] border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

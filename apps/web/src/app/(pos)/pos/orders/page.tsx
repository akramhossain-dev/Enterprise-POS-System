'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOrders } from '@/hooks/use-sales-return';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Search,
  Calendar,
  FolderClock,
  ChevronLeft,
  ChevronRight,
  User,
  CircleAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

export default function POSOrdersHistoryPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch orders list
  const { data: orderData, isLoading } = useOrders({
    q: query || undefined,
    status: status === 'ALL' ? undefined : status,
    page: currentPage,
    limit: 10,
  });

  const orders = orderData?.data || [];
  const meta = orderData?.meta;

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'VOIDED':
        return 'bg-rose-955/40 border-rose-900/60 text-rose-400';
      case 'PARTIALLY_RETURNED':
        return 'bg-amber-955/40 border-amber-900/60 text-amber-400';
      case 'FULLY_RETURNED':
        return 'bg-rose-950/40 border-rose-900/60 text-rose-455';
      default:
        return 'bg-emerald-955/40 border-emerald-900/60 text-emerald-400';
    }
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
    <PageContainer className="max-w-6xl mx-auto py-6 text-slate-100 select-none text-left">
      {/* Back to POS Terminal link */}
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
        title="POS Sales Order History"
        description="Verify completed checkout lists, print histories, void orders list, and return tags."
      />

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search invoice number, customer..."
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
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0c1220] border border-slate-850 text-slate-300 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[130px]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="VOIDED">Voided</option>
            <option value="PARTIALLY_RETURNED">Partially Returned</option>
            <option value="FULLY_RETURNED">Fully Returned</option>
          </select>
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Searching orders archive...</div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <Card
              key={order.id}
              className="bg-[#0c1220] border-slate-800 hover:border-slate-750 transition-colors"
            >
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-bold text-slate-200"># {order.invoiceNumber}</span>
                    <Badge
                      className={cn(
                        'text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border',
                        getStatusColor(order.status),
                      )}
                    >
                      {order.status}
                    </Badge>
                    <span className="text-[10px] bg-slate-900 border border-slate-850 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                      {order.paymentMethod}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{new Date(order.completedAt).toLocaleString()}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span>Cashier: {order.cashierName}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-400 font-medium">
                      Customer: {order.customerName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider font-mono">
                      Grand Total
                    </span>
                    <span className="font-mono font-black text-emerald-400 text-base sm:text-lg">
                      ${order.grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <Link href={`/pos/orders/${order.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-slate-800 bg-[#0c1220] hover:bg-slate-900 text-xs"
                    >
                      View Order Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-850 rounded-xl">
            <FolderClock className="h-10 w-10 mb-2 text-slate-800 mx-auto" />
            <p className="text-xs">No POS order records found.</p>
          </div>
        )}
      </div>

      {/* Pager */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-900 text-xs text-slate-500 font-mono">
          <p>
            Showing {orders.length} of {meta.total} orders
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
            <span className="text-slate-455">
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

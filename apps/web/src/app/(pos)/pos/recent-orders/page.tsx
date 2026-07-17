'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePOSStore } from '@/stores/pos.store';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Printer, Calendar, Search, CreditCard, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function POSRecentOrdersPage() {
  const { recentOrders } = usePOSStore();
  const [query, setQuery] = useState('');

  const filtered = recentOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(query.toLowerCase()) ||
      order.cart.name.toLowerCase().includes(query.toLowerCase()) ||
      (order.cart.customer &&
        order.cart.customer.fullName.toLowerCase().includes(query.toLowerCase())),
  );

  const handlePrintReceipt = (orderId: string) => {
    toast.success(`Receipt printed for completed sale ${orderId}`);
  };

  return (
    <PageContainer className="max-w-4xl mx-auto py-6 text-foreground select-none">
      {/* Navigation */}
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
        title="Recent Completed Sales"
        description="Review receipts, cash change calculations, and transaction records compiled during cashier session."
      />

      {/* Search Header */}
      <div className="relative mb-6 mt-4 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search recent sales (ID, Cart name, customer)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 bg-muted border-border text-foreground text-xs focus-visible:ring-emerald-500 h-9"
        />
      </div>

      {/* Sales list */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((order) => {
            const date = new Date(order.completedAt).toLocaleString();
            const itemsCount = order.cart.items.reduce((acc, it) => acc + it.quantity, 0);

            return (
              <Card
                key={order.id}
                className="bg-cardard border-border hover:border-slate-750 transition-colors"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm">
                  {/* Order info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-foreground">Order ID: #{order.id}</span>
                      <span className="text-[10px] bg-accent border border-border text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                        {order.cart.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3 shrink-0" />
                        <span>
                          {itemsCount} item{itemsCount !== 1 && 's'}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground font-mono">
                      <span>Method: {order.paymentMethod}</span>
                      <span>|</span>
                      <span>Paid: ${order.paymentAmount.toFixed(2)}</span>
                      <span>|</span>
                      <span>Change: ${order.changeAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">
                        Sale Total
                      </span>
                      <span className="font-mono font-black text-emerald-400 text-base">
                        ${order.grandTotal.toFixed(2)}
                      </span>
                    </div>

                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handlePrintReceipt(order.id)}
                      className="h-8 w-8 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Print Customer Receipt"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl text-muted-foreground m-2">
            <ShoppingBag className="h-10 w-10 mb-2 text-slate-800" />
            <p className="text-xs">No recent completed sales logged in this terminal session.</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

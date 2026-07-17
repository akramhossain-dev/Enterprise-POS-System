'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePOSStore } from '@/stores/pos.store';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Play, Trash2, Calendar, FileText, Search, User } from 'lucide-react';
import { toast } from 'sonner';

export default function POSHeldOrdersPage() {
  const { heldOrders, resumeOrder, deleteHeldOrder } = usePOSStore();
  const [query, setQuery] = useState('');

  const filtered = heldOrders.filter(
    (h) =>
      h.cart.name.toLowerCase().includes(query.toLowerCase()) ||
      (h.notes && h.notes.toLowerCase().includes(query.toLowerCase())) ||
      (h.cart.customer && h.cart.customer.fullName.toLowerCase().includes(query.toLowerCase())),
  );

  const handleResume = (id: string) => {
    resumeOrder(id);
    toast.success('Resumed held order successfully.');
  };

  const handleDelete = (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this held order?');
    if (confirm) {
      deleteHeldOrder(id);
    }
  };

  return (
    <PageContainer className="max-w-4xl mx-auto py-6 text-foreground select-none">
      {/* Navigation back */}
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
        title="Held Orders Queue"
        description="Search, view details, and resume orders placed on hold by terminal operators."
      />

      {/* Search Header */}
      <div className="relative mb-6 mt-4 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search held orders (Cart name, customer, notes)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 bg-muted border-border text-foreground text-xs focus-visible:ring-emerald-500 h-9"
        />
      </div>

      {/* Held list */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((held) => {
            const date = new Date(held.heldAt).toLocaleString();
            const cartItemsCount = held.cart.items.reduce((acc, it) => acc + it.quantity, 0);

            // Calculate totals
            const cartSubtotal = held.cart.items.reduce(
              (acc, it) => acc + (it.quantity * it.unitPrice - it.discount),
              0,
            );
            const grandTotal =
              cartSubtotal -
              held.cart.globalDiscount +
              cartSubtotal * (held.cart.globalTaxRate / 100);

            return (
              <Card
                key={held.id}
                className="bg-card border-border hover:border-slate-750 transition-colors"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm">
                  {/* Cart info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-foreground">{held.cart.name}</span>
                      <span className="text-[10px] bg-accent border border-border text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                        {cartItemsCount} item{cartItemsCount !== 1 && 's'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 shrink-0" />
                        <span>Customer: {held.cart.customer?.fullName || 'Walk-in'}</span>
                      </span>
                    </div>

                    {held.notes && (
                      <p className="text-[11px] text-muted-foreground italic">
                        Notes: &quot;{held.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Resume & Delete Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">
                        Total Value
                      </span>
                      <span className="font-mono font-black text-emerald-400 text-base">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Link href="/pos">
                        <Button
                          size="sm"
                          onClick={() => handleResume(held.id)}
                          className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1"
                        >
                          <Play className="h-3 w-3 fill-slate-950" />
                          <span>Resume</span>
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDelete(held.id)}
                        className="h-8 w-8 border-border hover:bg-rose-950/20 hover:text-rose-400 text-muted-foreground"
                        title="Delete Held Cart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl text-muted-foreground m-2">
            <FileText className="h-10 w-10 mb-2 text-slate-800" />
            <p className="text-xs">No held orders found matching filter criteria.</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

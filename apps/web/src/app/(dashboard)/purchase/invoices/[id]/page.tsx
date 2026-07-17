'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Package,
  User,
  Warehouse as WarehouseIcon,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  DollarSign,
  Loader2,
  Scale,
} from 'lucide-react';
import { useSupplierInvoiceDetails } from '@/hooks/use-goods-receive';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/purchase/status-badge';
import { InvoiceCard } from '@/components/receive/invoice-card';
import { toast } from 'sonner';

export default function SupplierInvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params['id'] as string;

  const { data: invoice, isLoading, error } = useSupplierInvoiceDetails(id);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-4">
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="md:col-span-2 h-96 w-full rounded-xl" />
            <Skeleton className="h-60 w-full rounded-xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !invoice) {
    return (
      <PageContainer>
        <div className="text-center py-16 bg-card border rounded-2xl text-sm">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">Invoice Not Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The requested supplier invoice does not exist.
          </p>
          <Link href="/purchase/invoices" className="inline-block mt-4">
            <Button size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Invoices
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/purchase/invoices">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Directory
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Supplier Invoice: ${invoice.invoiceNumber}`}
        description={`Accounts payable invoice registered on ${new Date(invoice.createdAt).toLocaleString()}`}
      />

      <div className="grid gap-6 md:grid-cols-3 text-sm">
        {/* Left main info */}
        <div className="md:col-span-2 space-y-6">
          {/* Linked GRN Info */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Goods Receive Note (GRN) Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                    GRN Number
                  </span>
                  <Link
                    href={`/purchase/receive/${invoice.goodsReceiveId}`}
                    className="font-mono font-bold text-primary hover:underline text-sm mt-1 block"
                  >
                    {invoice.goodsReceive?.grnNumber || 'GRN Details'}
                  </Link>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                    Arrival Date
                  </span>
                  <span className="text-foreground text-xs font-semibold block mt-1">
                    {invoice.goodsReceive?.receiveDate
                      ? new Date(invoice.goodsReceive.receiveDate).toLocaleDateString()
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Items checklist */}
              {invoice.goodsReceive?.items && (
                <div className="border rounded-lg overflow-hidden mt-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                        <th className="p-3 pl-6">Product details</th>
                        <th className="p-3 text-right">Received Quantity</th>
                        <th className="p-3 text-right pr-6">Unit Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.goodsReceive.items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b last:border-b-0 border-border bg-card hover:bg-muted/10"
                        >
                          <td className="p-3 pl-6 font-semibold text-foreground text-sm">
                            {item.product?.name || '—'}
                          </td>
                          <td className="p-3 text-right font-mono font-semibold">
                            {Number(item.receivedQuantity).toFixed(0)} units
                          </td>
                          <td className="p-3 text-right pr-6 font-mono font-bold text-foreground">
                            ${Number(item.unitCost).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side stats */}
        <div className="space-y-6">
          {/* Invoice Summary Card */}
          <InvoiceCard invoice={invoice} />

          {/* Verification matching */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-500 animate-pulse" /> Reconciliations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Run the 3-Way matching logic to compare PO ordered numbers, GRN intakes, and this
                Invoice.
              </p>
              <Link
                href={`/purchase/matching?goodsReceiveId=${invoice.goodsReceiveId}`}
                className="w-full block"
              >
                <Button className="w-full bg-primary hover:bg-primary/95 text-primary-foreground gap-1.5">
                  <Scale className="w-4 h-4" /> Run 3-Way Invoice Match
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

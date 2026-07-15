'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
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
  DollarSign,
} from 'lucide-react';
import { useAdjustmentDetails } from '@/hooks/use-operations';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';

export default function AdjustmentDetailsPage() {
  const params = useParams();
  const id = params['id'] as string;

  const { data: adjustment, isLoading, error } = useAdjustmentDetails(id);

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

  if (error || !adjustment) {
    return (
      <PageContainer>
        <div className="text-center py-16 bg-card border rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">Adjustment Record Not Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The requested stock adjustment record does not exist or you lack sufficient access.
          </p>
          <Link href="/inventory/adjustments" className="inline-block mt-4">
            <Button size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Adjustments
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const qty = Number(adjustment.quantity);
  const cost = Number(adjustment.product?.purchasePrice || 0);
  const financialImpact = qty * cost;

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/inventory/adjustments">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Directory
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Adjustment: ${adjustment.id.slice(0, 8).toUpperCase()}`}
        description={`Record audits for stock correction registered on ${new Date(adjustment.createdAt).toLocaleString()}`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left card */}
        <Card className="md:col-span-2 shadow-sm border-border bg-card">
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Adjustment Audit Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                  Adjustment Type
                </span>
                <span
                  className={cn(
                    'inline-block px-2.5 py-0.5 rounded text-xs font-bold border mt-1',
                    adjustment.type === 'INCREASE' &&
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    adjustment.type === 'DECREASE' &&
                      'bg-rose-500/10 text-rose-500 border-rose-500/20',
                    adjustment.type === 'DAMAGE' &&
                      'bg-amber-500/10 text-amber-500 border-amber-500/20',
                    adjustment.type === 'EXPIRED' &&
                      'bg-rose-500/10 text-rose-500 border-rose-500/20',
                    adjustment.type === 'LOST' && 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                  )}
                >
                  {adjustment.type}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                  Quantity Adjusted
                </span>
                <span
                  className={cn(
                    'text-sm font-bold block mt-1',
                    adjustment.type === 'INCREASE' ? 'text-emerald-500' : 'text-rose-500',
                  )}
                >
                  {adjustment.type === 'INCREASE' ? '+' : '-'}
                  {qty.toFixed(2)} units
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                  Conducted Reason
                </span>
                <span className="font-semibold text-foreground block mt-1">
                  {adjustment.reason}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                  Est. Financial Impact
                </span>
                <span className="font-bold text-foreground block mt-1 flex items-center text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  {financialImpact.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Product card info */}
            <div className="border-t border-border/60 pt-4 space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <Package className="w-4 h-4 text-primary" /> Affected Product Item
              </h4>
              <div className="grid gap-4 sm:grid-cols-2 bg-muted/20 p-4 rounded-xl border border-border/40">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">
                    Product Name
                  </span>
                  <span className="font-semibold text-foreground">
                    {adjustment.product?.name || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">
                    SKU Code
                  </span>
                  <span className="font-mono text-xs font-semibold bg-muted px-1.5 py-0.5 rounded text-foreground inline-block mt-0.5">
                    {adjustment.product?.sku || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">
                    Barcode ID
                  </span>
                  <span className="text-muted-foreground">
                    {adjustment.product?.barcode || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">
                    Unit Type
                  </span>
                  <span className="text-muted-foreground">
                    {adjustment.product?.unit?.name || 'Units'}
                  </span>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="border-t border-border/60 pt-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                Remarks & Notes
              </span>
              <p className="text-foreground bg-muted/20 border p-3 rounded-lg mt-1 whitespace-pre-wrap italic">
                {adjustment.remarks || 'No remarks recorded.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right side stats */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <WarehouseIcon className="w-4 h-4 text-indigo-500" /> Warehouse Location
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <div>
                <span className="text-muted-foreground block uppercase text-[10px]">
                  Depot Facility
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {adjustment.warehouse?.name}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block uppercase text-[10px]">
                  Facility Code
                </span>
                <span className="font-semibold text-foreground">{adjustment.warehouse?.code}</span>
              </div>
              <div>
                <span className="text-muted-foreground block uppercase text-[10px]">
                  City Address
                </span>
                <span className="text-muted-foreground">
                  {adjustment.warehouse?.address || 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-500" /> Operator Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <div>
                <span className="text-muted-foreground block uppercase text-[10px]">
                  Recorded By (ID)
                </span>
                <span className="font-semibold text-foreground font-mono">
                  {adjustment.createdBy}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block uppercase text-[10px]">
                  Reconciled Approver (ID)
                </span>
                <span className="font-mono text-foreground font-semibold">
                  {adjustment.approvedBy || 'Auto-Approved (System)'}
                </span>
              </div>
              <div className="border-t pt-3 flex items-center gap-1.5 text-emerald-500 bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold">Reconciliation Completed</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

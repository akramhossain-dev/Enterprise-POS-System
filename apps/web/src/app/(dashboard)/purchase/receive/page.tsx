'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Plus,
  RefreshCw,
  TrendingUp,
  Building2,
  DollarSign,
  Package,
  Layers,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import { useGRNs } from '@/hooks/use-goods-receive';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GrnCard } from '@/components/receive/grn-card';
import { StatusBadge } from '@/components/purchase/status-badge';
import { cn } from '@/utils/cn';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function GoodsReceiveDashboard() {
  const {
    data: grnResponse,
    isLoading,
    refetch,
    isFetching,
  } = useGRNs({
    page: 1,
    limit: 20,
  });

  const grns = grnResponse?.data || [];

  const metrics = React.useMemo(() => {
    const totalCount = grns.length;
    let draft = 0;
    let completed = 0;
    let cancelled = 0;
    let totalVal = 0;

    grns.forEach((g) => {
      const status = g.status.toUpperCase();
      const val = Number(g.grandTotal || g.subtotal || 0);

      if (status === 'DRAFT') draft++;
      else if (status === 'COMPLETED') completed++;
      else if (status === 'CANCELLED') cancelled++;

      if (status === 'COMPLETED') {
        totalVal += val;
      }
    });

    return {
      totalCount,
      draft,
      completed,
      cancelled,
      totalVal,
    };
  }, [grns]);

  // Monthly trends mock
  const chartData = [
    { name: 'Jan', value: 8500 },
    { name: 'Feb', value: 11200 },
    { name: 'Mar', value: 14500 },
    { name: 'Apr', value: 9200 },
    { name: 'May', value: 17100 },
    { name: 'Jun', value: metrics.totalVal > 0 ? metrics.totalVal : 13800 },
  ];

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/purchase">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            &larr; Back to Procurement
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Inventory Receiving (GRN) Dashboard"
        description="Receive incoming supplier stock, inspect cargo shipments, assign serial and batch numbers, and audit GRN statuses."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            </Button>
            <Link href="/purchase/receive/list">
              <Button size="sm" variant="outline">
                GRN Directory
              </Button>
            </Link>
            <Link href="/purchase/receive/new">
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" /> Receive PO
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metric summary grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <GrnCard
          title="Total Receipts"
          value={metrics.totalCount}
          description="Total GRNs registered"
          icon={FileSpreadsheet}
        />
        <GrnCard
          title="Verifying (Draft)"
          value={metrics.draft}
          description="Awaiting stock commit"
          icon={Clock}
          variant="warning"
        />
        <GrnCard
          title="Committed Stock Value"
          value={`$${metrics.totalVal.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          description="Total confirmed cargo valuation"
          icon={DollarSign}
          variant="success"
        />
        <GrnCard
          title="Completed / Cancelled"
          value={`${metrics.completed} / ${metrics.cancelled}`}
          description="Successful vs aborted receipts"
          icon={CheckCircle}
          variant="info"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6 text-sm">
        {/* Trend chart */}
        <Card className="md:col-span-2 shadow-sm border-border bg-card">
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" /> Monthly Stock Receiving Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip formatter={(value) => [`$${value}`, 'Received Stock']} />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Shortcuts Panel */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" /> Logistics Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Link href="/purchase/receive/new" className="block">
              <Button
                variant="outline"
                className="w-full justify-between text-left text-xs h-10 border-border bg-muted/20"
              >
                <span className="flex items-center gap-2 text-foreground font-semibold">
                  <Truck className="w-4 h-4 text-primary shrink-0" /> Receive Shipments
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>

            <Link href="/purchase/invoices" className="block">
              <Button
                variant="outline"
                className="w-full justify-between text-left text-xs h-10 border-border bg-muted/20"
              >
                <span className="flex items-center gap-2 text-foreground font-semibold">
                  <FileSpreadsheet className="w-4 h-4 text-amber-500 shrink-0" /> Supplier Invoices
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>

            <Link href="/purchase/matching" className="block">
              <Button
                variant="outline"
                className="w-full justify-between text-left text-xs h-10 border-border bg-muted/20"
              >
                <span className="flex items-center gap-2 text-foreground font-semibold">
                  <Inbox className="w-4 h-4 text-emerald-500 shrink-0" /> 3-Way Matching Tool
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent receipts table */}
      <Card className="shadow-sm border-border bg-card text-sm">
        <CardHeader className="border-b flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-sm font-semibold">Recent Goods Receive Notes</CardTitle>
            <CardDescription className="text-xs">Latest stock intake verifications</CardDescription>
          </div>
          <Link href="/purchase/receive/list">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
              View all GRNs &rarr;
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                <th className="p-3 pl-6">GRN Number</th>
                <th className="p-3">PO Reference</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Warehouse</th>
                <th className="p-3 text-right">Grand Total</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center pr-6">Receive Date</th>
              </tr>
            </thead>
            <tbody>
              {grns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground italic">
                    No Goods Receive Notes found. Register stock intake against a PO.
                  </td>
                </tr>
              ) : (
                grns.slice(0, 5).map((g) => (
                  <tr
                    key={g.id}
                    className="border-b last:border-b-0 border-border bg-card hover:bg-muted/10"
                  >
                    <td className="p-3 pl-6">
                      <Link
                        href={`/purchase/receive/${g.id}`}
                        className="font-mono font-bold text-primary hover:underline"
                      >
                        {g.grnNumber}
                      </Link>
                    </td>
                    <td className="p-3">
                      {g.purchaseOrder ? (
                        <Link
                          href={`/purchase/orders/${g.purchaseOrderId}`}
                          className="font-mono font-bold text-foreground/80 hover:underline"
                        >
                          {g.purchaseOrder.purchaseOrderNumber}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-foreground">
                      {g.supplier?.companyName || '—'}
                    </td>
                    <td className="p-3 text-muted-foreground">{g.warehouse?.name || '—'}</td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      ${Number(g.grandTotal || g.subtotal).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="p-3 text-center pr-6 text-muted-foreground">
                      {new Date(g.receiveDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

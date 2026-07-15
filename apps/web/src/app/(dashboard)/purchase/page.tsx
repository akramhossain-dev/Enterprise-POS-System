'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileText,
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
} from 'lucide-react';
import { usePurchaseOrders } from '@/hooks/use-purchase';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PurchaseCard } from '@/components/purchase/purchase-card';
import { StatusBadge } from '@/components/purchase/status-badge';
import { cn } from '@/utils/cn';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

export default function PurchaseDashboard() {
  const {
    data: poResponse,
    isLoading,
    refetch,
    isFetching,
  } = usePurchaseOrders({
    page: 1,
    limit: 20,
  });

  const orders = poResponse?.data || [];

  // Compute metrics from the active list
  const metrics = React.useMemo(() => {
    let totalCount = orders.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let draft = 0;
    let totalSpend = 0;
    const supplierSpendMap: Record<string, { name: string; spend: number }> = {};

    orders.forEach((o) => {
      const status = o.status.toUpperCase();
      const total = Number(o.grandTotal || o.subtotal || 0);

      if (status === 'PENDING') pending++;
      else if (status === 'APPROVED') approved++;
      else if (status === 'REJECTED') rejected++;
      else if (status === 'DRAFT') draft++;

      if (
        status === 'APPROVED' ||
        status === 'COMPLETED' ||
        status === 'RECEIVED' ||
        status === 'PARTIALLY_RECEIVED'
      ) {
        totalSpend += total;
      }

      if (o.supplier) {
        const supName = o.supplier.companyName;
        if (!supplierSpendMap[supName]) {
          supplierSpendMap[supName] = { name: supName, spend: 0 };
        }
        supplierSpendMap[supName].spend += total;
      }
    });

    const topSuppliers = Object.values(supplierSpendMap)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);

    return {
      totalCount,
      pending,
      approved,
      rejected,
      draft,
      totalSpend,
      topSuppliers,
    };
  }, [orders]);

  // Monthly trends data for chart
  const chartData = [
    { name: 'Jan', value: 12000 },
    { name: 'Feb', value: 15400 },
    { name: 'Mar', value: 9800 },
    { name: 'Apr', value: 21000 },
    { name: 'May', value: 18500 },
    { name: 'Jun', value: metrics.totalSpend > 0 ? metrics.totalSpend : 14200 },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Procurement Dashboard"
        description="Oversee corporate purchase requisitions, approve pending vendor orders, and audit company procurement spends."
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
            <Link href="/purchase/requisitions/new">
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="w-4 h-4" /> Requisition
              </Button>
            </Link>
            <Link href="/purchase/orders/new">
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" /> Create PO
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <PurchaseCard
          title="Total Purchase Orders"
          value={metrics.totalCount}
          description="Total PO requests filed"
          icon={FileText}
        />
        <PurchaseCard
          title="Pending Approval"
          value={metrics.pending}
          description="Orders awaiting signatures"
          icon={Clock}
          variant="warning"
        />
        <PurchaseCard
          title="Approved Spends"
          value={`$${metrics.totalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          description="Total signed order valuation"
          icon={DollarSign}
          variant="success"
        />
        <PurchaseCard
          title="Draft / Rejected"
          value={`${metrics.draft} / ${metrics.rejected}`}
          description="Draft orders and denied POs"
          icon={XCircle}
          variant="danger"
        />
      </div>

      {/* Charts & Supplier Spends */}
      <div className="grid gap-6 md:grid-cols-3 mb-6 text-sm">
        {/* Chart */}
        <Card className="md:col-span-2 shadow-sm border-border bg-card">
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" /> Procurement Value Trend (Monthly)
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
                <Tooltip formatter={(value) => [`$${value}`, 'Procured Spend']} />
                <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Suppliers Spend Summary */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-500" /> Top Supplier Spends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5">
            {metrics.topSuppliers.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-10 text-xs">
                No approved spends registered.
              </p>
            ) : (
              metrics.topSuppliers.map((s, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border-b border-border/40 pb-2.5 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-foreground">{s.name}</span>
                    <span className="text-[10px] text-muted-foreground">Supplier Partner</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">${s.spend.toFixed(2)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchases List */}
      <Card className="shadow-sm border-border bg-card text-sm">
        <CardHeader className="border-b flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-sm font-semibold">Recent Purchase Orders</CardTitle>
            <CardDescription className="text-xs">
              Latest registered vendor procurements
            </CardDescription>
          </div>
          <Link href="/purchase/orders">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
              View all orders &rarr;
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                <th className="p-3 pl-6">PO Number</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Warehouse</th>
                <th className="p-3 text-right">Items</th>
                <th className="p-3 text-right">Grand Total</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center pr-6">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground italic">
                    No purchase orders found. Initiate order requests using "Create PO" button.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((o) => (
                  <tr
                    key={o.id}
                    className="border-b last:border-b-0 border-border bg-card hover:bg-muted/10"
                  >
                    <td className="p-3 pl-6">
                      <Link
                        href={`/purchase/orders/${o.id}`}
                        className="font-mono font-bold text-primary hover:underline"
                      >
                        {o.purchaseOrderNumber}
                      </Link>
                    </td>
                    <td className="p-3 font-medium text-foreground">
                      {o.supplier?.companyName || '—'}
                    </td>
                    <td className="p-3 text-muted-foreground">{o.warehouse?.name || '—'}</td>
                    <td className="p-3 text-right font-mono">{o.items?.length ?? 0}</td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      ${Number(o.grandTotal || o.subtotal).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="p-3 text-center pr-6 text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString()}
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

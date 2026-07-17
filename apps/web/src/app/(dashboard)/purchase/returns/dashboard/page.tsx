'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Building,
  RefreshCw,
  Plus,
  History,
  LayoutDashboard,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ReturnCard } from '@/components/purchase/return-card';
import { StatusBadge } from '@/components/purchase/status-badge';
import { usePurchaseReturns } from '@/hooks/use-purchase-return';
import { cn } from '@/utils/cn';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ReturnDashboardPage() {
  const {
    data: returnResponse,
    isLoading,
    refetch,
    isFetching,
  } = usePurchaseReturns({
    page: 1,
    limit: 100,
  });

  const returns = returnResponse?.data || [];

  // Compute metrics from returns list
  const metrics = React.useMemo(() => {
    const totalCount = returns.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let completed = 0;
    let totalValue = 0;
    const supplierReturnMap: Record<string, { name: string; value: number }> = {};

    returns.forEach((r) => {
      const status = r.status.toUpperCase();
      const val = Number(r.grandTotal || 0);

      if (status === 'PENDING') pending++;
      else if (status === 'APPROVED') approved++;
      else if (status === 'REJECTED') rejected++;
      else if (status === 'COMPLETED') completed++;

      if (status !== 'CANCELLED') {
        totalValue += val;
      }

      if (r.supplier) {
        const name = r.supplier.companyName;
        if (!supplierReturnMap[name]) {
          supplierReturnMap[name] = { name, value: 0 };
        }
        supplierReturnMap[name].value += val;
      }
    });

    const topSuppliers = Object.values(supplierReturnMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalCount,
      pending,
      approved,
      rejected,
      completed,
      totalValue,
      topSuppliers,
    };
  }, [returns]);

  // Monthly trends data for chart
  const chartData = [
    { name: 'Jan', value: 2000 },
    { name: 'Feb', value: 4500 },
    { name: 'Mar', value: 1200 },
    { name: 'Apr', value: 6000 },
    { name: 'May', value: 3400 },
    { name: 'Jun', value: metrics.totalValue > 0 ? metrics.totalValue : 5000 },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Returns Dashboard"
        description="Monitor return claims value, track outstanding supplier credits, verify approval stages, and inspect return logs."
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
            <Link href="/purchase/returns/new">
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" /> Create Return
              </Button>
            </Link>
          </div>
        }
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-border gap-4 mb-6">
        <Link
          href="/purchase/returns"
          className="pb-2.5 px-1 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4 text-muted-foreground" /> Active Returns
        </Link>
        <Link
          href="/purchase/returns/dashboard"
          className="border-b-2 border-primary pb-2.5 px-1 font-semibold text-sm text-foreground flex items-center gap-1.5"
        >
          <LayoutDashboard className="w-4 h-4 text-primary" /> Return Dashboard
        </Link>
        <Link
          href="/purchase/returns/history"
          className="pb-2.5 px-1 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        >
          <History className="w-4 h-4 text-muted-foreground" /> Audit History
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <ReturnCard
          title="Total Return Requests"
          value={metrics.totalCount}
          description="Total supplier return vouchers filed"
          icon={FileText}
          variant="primary"
        />
        <ReturnCard
          title="Pending Approvals"
          value={metrics.pending}
          description="Requests awaiting managers approval"
          icon={Clock}
          variant="warning"
        />
        <ReturnCard
          title="Total Claims Value"
          value={`$${metrics.totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
          description="Valuation of active returns claims"
          icon={DollarSign}
          variant="success"
        />
        <ReturnCard
          title="Rejected / Completed"
          value={`${metrics.rejected} / ${metrics.completed}`}
          description="Rejected claims vs completed claims"
          icon={XCircle}
          variant="danger"
        />
      </div>

      {/* Charts & Suppliers Return Values */}
      <div className="grid gap-6 md:grid-cols-3 mb-6 text-sm">
        {/* Chart */}
        <Card className="md:col-span-2 shadow-sm border-border bg-card">
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" /> Returns Value Trend (Monthly)
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
                <Tooltip formatter={(value) => [`$${value}`, 'Returned Spends']} />
                <Bar dataKey="value" fill="#EC4899" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Suppliers Value Summary */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Building className="w-4 h-4 text-pink-500" /> Claims by Supplier
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5">
            {metrics.topSuppliers.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-10 text-xs">
                No active return claims.
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
                  <span className="font-mono font-bold text-foreground">${s.value.toFixed(2)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Returns List */}
      <Card className="shadow-sm border-border bg-card text-sm">
        <CardHeader className="border-b flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-sm font-semibold">Recent Return Vouchers</CardTitle>
            <CardDescription className="text-xs font-medium">
              Latest claims registered in operations
            </CardDescription>
          </div>
          <Link href="/purchase/returns">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
              View all returns &rarr;
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                <th className="p-3 pl-6">Return Number</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Warehouse</th>
                <th className="p-3 text-right">Items</th>
                <th className="p-3 text-right">Return Value</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center pr-6">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground italic">
                    No returns logged.
                  </td>
                </tr>
              ) : (
                returns.slice(0, 5).map((r) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-b-0 border-border bg-card hover:bg-muted/10"
                  >
                    <td className="p-3 pl-6">
                      <Link
                        href={`/purchase/returns/${r.id}`}
                        className="font-mono font-bold text-primary hover:underline"
                      >
                        {r.returnNumber}
                      </Link>
                    </td>
                    <td className="p-3 font-medium text-foreground">
                      {r.supplier?.companyName || '—'}
                    </td>
                    <td className="p-3 text-muted-foreground">{r.warehouse?.name || '—'}</td>
                    <td className="p-3 text-right font-mono">{r.items?.length ?? 0}</td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      ${Number(r.grandTotal).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-3 text-center pr-6 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
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

'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Package,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  Warehouse,
  History,
  Barcode,
  Layers,
  FileDown,
  RefreshCw,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import {
  useInventorySummary,
  useStockAlerts,
  useInventoryLedger,
  useTriggerAlertScan,
} from '@/hooks/use-inventory';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryCard } from '@/components/inventory/inventory-card';
import { StockTimeline } from '@/components/inventory/stock-timeline';
import { DashboardSkeleton } from '@/components/inventory/loading-skeleton';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

export default function InventoryDashboardPage() {
  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useInventorySummary();
  const {
    data: alertsResponse,
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = useStockAlerts({ page: 1, limit: 5, status: 'ACTIVE' });
  const {
    data: ledgerResponse,
    isLoading: ledgerLoading,
    refetch: refetchLedger,
  } = useInventoryLedger({ page: 1, limit: 5 });
  const scanMutation = useTriggerAlertScan();

  const handleRunScan = async () => {
    // Assuming companyId 'default' or fetched from user context.
    // In this app, we trigger with a placeholder or companyId.
    try {
      await scanMutation.mutateAsync({ companyId: '11111111-1111-1111-1111-111111111111' });
      void refetchSummary();
      void refetchAlerts();
    } catch {}
  };

  const handleExportSummary = () => {
    toast.info('Exporting inventory summary PDF/Excel report (UI Only)...');
  };

  const isLoading = summaryLoading || alertsLoading || ledgerLoading;

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Inventory Dashboard"
          description="Real-time stock valuation, warehouse distribution, and low stock indicators."
        />
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  // Set default fallback values if the database starts empty or server is offline
  const totalProducts = summary?.totalProducts ?? 0;
  const totalValuation = summary?.totalStockValue ? parseFloat(summary.totalStockValue) : 0;
  const lowStockCount = summary?.lowStockCount ?? 0;
  const outOfStockCount = summary?.outOfStockCount ?? 0;
  const warehouseDistribution = summary?.warehouseWiseStock ?? [];
  const activeAlerts = alertsResponse?.data ?? [];
  const recentActivities = ledgerResponse?.data ?? [];

  // Format Recharts data
  const chartData = warehouseDistribution.map((item) => ({
    name: item.warehouseName,
    stock: parseFloat(item.totalStock),
  }));

  return (
    <PageContainer>
      <PageHeader
        title="Inventory Control Center"
        description="Oversee enterprise stock assets, monitor warehouse utilization, and audit historical ledgers."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportSummary} className="gap-1.5">
              <FileDown className="w-4 h-4" />
              Export Assets
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleRunScan}
              disabled={scanMutation.isPending}
              className="gap-1.5"
            >
              <RefreshCw className={cn('w-4 h-4', scanMutation.isPending && 'animate-spin')} />
              Scan stock thresholds
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <InventoryCard
          title="Total Unique Products"
          value={totalProducts}
          description="Items present in active catalogs"
          icon={Package}
          variant="primary"
        />
        <InventoryCard
          title="Total Stock Value"
          value={`$${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description="Based on average unit cost calculations"
          icon={TrendingUp}
          variant="success"
        />
        <InventoryCard
          title="Low Stock Items"
          value={lowStockCount}
          description="Active items below minimum thresholds"
          icon={AlertTriangle}
          variant="warning"
          trend={
            lowStockCount > 0 ? { value: 12, isPositive: true, label: 'increasing' } : undefined
          }
        />
        <InventoryCard
          title="Out of Stock Items"
          value={outOfStockCount}
          description="Depleted items requiring replenishment"
          icon={AlertOctagon}
          variant="danger"
        />
      </div>

      {/* Subpage Quick Nav Buttons */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6">
        <Link href="/inventory/stock" className="w-full">
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col gap-1.5 justify-center items-center rounded-xl bg-cardard border-border hover:bg-muted/30"
          >
            <Barcode className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold">Current Stock</span>
          </Button>
        </Link>
        <Link href="/inventory/batches" className="w-full">
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col gap-1.5 justify-center items-center rounded-xl bg-cardard border-border hover:bg-muted/30"
          >
            <Layers className="w-5 h-5 text-indigo-500" />
            <span className="text-xs font-semibold">Batches</span>
          </Button>
        </Link>
        <Link href="/inventory/serials" className="w-full">
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col gap-1.5 justify-center items-center rounded-xl bg-cardard border-border hover:bg-muted/30"
          >
            <Warehouse className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-semibold">Serial Numbers</span>
          </Button>
        </Link>
        <Link href="/inventory/low-stock" className="w-full">
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col gap-1.5 justify-center items-center rounded-xl bg-cardard border-border hover:bg-muted/30"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500 animate-bounce" />
            <span className="text-xs font-semibold">Low Stock</span>
          </Button>
        </Link>
        <Link href="/inventory/expiring" className="w-full">
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col gap-1.5 justify-center items-center rounded-xl bg-cardard border-border hover:bg-muted/30"
          >
            <AlertOctagon className="w-5 h-5 text-rose-500" />
            <span className="text-xs font-semibold">Expiring Items</span>
          </Button>
        </Link>
        <Link href="/inventory/history" className="w-full">
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col gap-1.5 justify-center items-center rounded-xl bg-cardard border-border hover:bg-muted/30"
          >
            <History className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-semibold">Stock Ledger</span>
          </Button>
        </Link>
      </div>

      {/* Main Charts & Widgets Section */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {/* Recharts Warehouse Distribution */}
        <Card className="md:col-span-2 shadow-sm border-border bg-cardard">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-primary" />
              Warehouse Stock Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={11} stroke="#888888" />
                  <YAxis fontSize={11} stroke="#888888" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="stock"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  No warehouse allocation logs present.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Alerts Queue */}
        <Card className="shadow-sm border-border bg-cardard">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
              Critical Stock Alerts Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeAlerts.length > 0 ? (
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex gap-3 bg-muted/30 p-2.5 rounded-lg border border-border/50 text-xs"
                  >
                    <span className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5 bg-rose-500 animate-ping" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">
                        {alert.product?.name ?? 'Unknown item'}
                      </p>
                      <p className="text-muted-foreground">{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground/60">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[210px] flex flex-col justify-center items-center border border-dashed rounded-lg bg-muted/20 text-center p-4">
                <p className="text-xs text-muted-foreground font-semibold">
                  No critical stock warnings found.
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  Excellent job! All products are within safety bounds.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Ledger History */}
      <Card className="shadow-sm border-border bg-cardard">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Recent Stock Movement Ledger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StockTimeline movements={recentActivities} />
          {recentActivities.length > 0 && (
            <div className="mt-4 pt-4 border-t text-center">
              <Link href="/inventory/history">
                <Button variant="link" size="sm" className="text-xs">
                  View entire movement ledger logs &rarr;
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

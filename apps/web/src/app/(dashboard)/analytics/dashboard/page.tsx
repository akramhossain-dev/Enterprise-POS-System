'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  useExecutiveDashboardStats,
  useSalesAnalyticsStats,
  usePurchaseAnalyticsStats,
  useInventoryAnalyticsStats,
  useCustomerAnalyticsStats,
} from '@/hooks/use-analytics';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { ChartCard } from '@/components/analytics/chart-card';
import { LeaderboardCard } from '@/components/analytics/leaderboard-card';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DollarSign,
  ShoppingCart,
  Users,
  SlidersHorizontal,
  RefreshCw,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Search,
  Printer,
  ArrowUp,
  ArrowDown,
  Move,
} from 'lucide-react';
import { toast } from 'sonner';

interface WidgetState {
  id: string;
  name: string;
  width: 'third' | 'half' | 'full'; // lg:col-span-4, lg:col-span-6, lg:col-span-12
  visible: boolean;
  order: number;
}

const DEFAULT_LAYOUT: WidgetState[] = [
  { id: 'revenue_trend', name: 'Revenue Trend Metrics', width: 'half', visible: true, order: 1 },
  {
    id: 'payment_methods',
    name: 'Payment Allocation Shares',
    width: 'half',
    visible: true,
    order: 2,
  },
  { id: 'top_products', name: 'Top Returned Products', width: 'third', visible: true, order: 3 },
  { id: 'top_customers', name: 'Top Customer Tiers', width: 'third', visible: true, order: 4 },
  { id: 'top_suppliers', name: 'Top Vendor Purchases', width: 'third', visible: true, order: 5 },
  { id: 'branch_sales', name: 'Revenue share by Branch', width: 'half', visible: true, order: 6 },
  {
    id: 'warehouse_value',
    name: 'Inventory Warehouses Stock',
    width: 'half',
    visible: true,
    order: 7,
  },
];

const LAYOUT_STORAGE_KEY = 'epos_executive_dashboard_layout_v2';

export default function ExecutiveDashboardPage() {
  const [layout, setLayout] = useState<WidgetState[]>(DEFAULT_LAYOUT);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [autoRefreshRate, setAutoRefreshRate] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch dashboard stats
  const {
    data: kpis,
    isLoading: isKpisLoading,
    refetch: refetchKpis,
  } = useExecutiveDashboardStats({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const {
    data: sales,
    isLoading: isSalesLoading,
    refetch: refetchSales,
  } = useSalesAnalyticsStats({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: purchases, refetch: refetchPurchases } = usePurchaseAnalyticsStats({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: inventory, refetch: refetchInventory } = useInventoryAnalyticsStats({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: customers, refetch: refetchCustomers } = useCustomerAnalyticsStats({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const handleRefreshAll = () => {
    void refetchKpis();
    void refetchSales();
    void refetchPurchases();
    void refetchInventory();
    void refetchCustomers();
    setLastUpdated(new Date());
    toast.success('Dashboard metrics updated.');
  };

  // Auto sync rate setup
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (autoRefreshRate > 0) {
      interval = setInterval(() => {
        handleRefreshAll();
      }, autoRefreshRate * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefreshRate]);

  // Load layout configurations
  useEffect(() => {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (saved) {
      try {
        setLayout(JSON.parse(saved));
      } catch {
        setLayout(DEFAULT_LAYOUT);
      }
    }
  }, []);

  const handleSaveLayout = () => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    toast.success('Executive dashboard configuration saved.');
    setIsCustomizeOpen(false);
  };

  const handleResetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    toast.success('Layout reset to manufacturing presets.');
  };

  const toggleWidgetVisibility = (id: string) => {
    setLayout(layout.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)));
  };

  const changeWidgetWidth = (id: string, width: WidgetState['width']) => {
    setLayout(layout.map((w) => (w.id === id ? { ...w, width } : w)));
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newLayout = [...layout].sort((a, b) => a.order - b.order);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= newLayout.length) return;

    const itemA = newLayout[index];
    const itemB = newLayout[targetIdx];
    if (!itemA || !itemB) return;

    // Swap order parameter
    const temp = itemA.order;
    itemA.order = itemB.order;
    itemB.order = temp;

    setLayout(newLayout.sort((a, b) => a.order - b.order));
  };

  if (isKpisLoading || isSalesLoading || !kpis || !sales) {
    return (
      <PageContainer className="max-w-7xl mx-auto py-6">
        <AnalyticsDashboardSkeleton />
      </PageContainer>
    );
  }

  // Filter top lists using query
  const filteredProducts = sales.mostReturnedProducts.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredCustomers =
    customers?.topCustomers.filter((c: any) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const filteredSuppliers = (purchases?.purchaseBySupplier || [])
    .filter((s: any) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((s: any, idx: number) => ({
      id: `sup-rank-${idx}`,
      name: s.name,
      amount: s.value,
    }));

  const visibleWidgets = [...layout].sort((a, b) => a.order - b.order).filter((w) => w.visible);

  const getColSpan = (width: WidgetState['width']) => {
    switch (width) {
      case 'third':
        return 'lg:col-span-4 col-span-12';
      case 'half':
        return 'lg:col-span-6 col-span-12';
      case 'full':
        return 'col-span-12';
    }
  };

  return (
    <PageContainer className="text-slate-100 select-none text-left print:bg-white print:text-black print:p-0">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
        <PageHeader
          title="Executive Analytics Dashboard"
          description="POS sales margins, procurement cost thresholds, inventory turnover speeds, and cashflow offsets."
        />

        <div className="flex flex-wrap gap-2 items-center self-end sm:self-auto text-xs">
          <div className="flex items-center gap-2 bg-[#0c1220] border border-slate-850 rounded-lg p-1">
            <span className="text-[10px] text-slate-500 font-bold px-1.5 uppercase font-mono">
              Auto Sync:
            </span>
            <select
              value={autoRefreshRate}
              onChange={(e) => setAutoRefreshRate(Number(e.target.value))}
              className="bg-transparent text-slate-200 outline-none cursor-pointer h-full text-[11px]"
            >
              <option value={0}>Disabled</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
            </select>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefreshAll}
              className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => setIsCustomizeOpen(true)}
            className="h-8 border-slate-800 bg-[#0c1220] hover:bg-slate-900 text-xs gap-1.5 text-slate-350"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Customize Grid</span>
          </Button>

          <Button
            size="sm"
            onClick={() => window.print()}
            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Query filters */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6 print:hidden">
        <div className="flex items-center gap-1.5 bg-[#0c1220] px-3 border border-slate-850 rounded-xl text-xs h-9 w-full">
          <span className="text-slate-500">From</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer h-full"
          />
          <span className="text-slate-500">To</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer h-full"
          />
        </div>

        <div className="relative flex-1 sm:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search products, top customers, or suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-4 print:hidden">
        <span>Sync Time: {lastUpdated.toLocaleTimeString()}</span>
        <span>Corporate Region: Global HQ</span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard
          title="Revenue Margin"
          value={kpis.revenue}
          growth={kpis.revenueChange}
          trend={kpis.revenueChange >= 0 ? 'up' : 'down'}
          icon={DollarSign}
          prefix="$"
          description="vs. last month"
          className="bg-[#0c1220] border-slate-800"
        />
        <KpiCard
          title="Net Operating Profit"
          value={kpis.netProfit}
          growth={kpis.netProfitChange}
          trend={kpis.netProfitChange >= 0 ? 'up' : 'down'}
          icon={DollarSign}
          prefix="$"
          description="vs. last month"
          className="bg-[#0c1220] border-slate-800 text-emerald-450"
        />
        <KpiCard
          title="Avg Order Value (AOV)"
          value={kpis.avgOrderValue}
          growth={kpis.avgOrderValueChange}
          trend={kpis.avgOrderValueChange >= 0 ? 'up' : 'down'}
          icon={ShoppingCart}
          prefix="$"
          className="bg-[#0c1220] border-slate-800"
        />
        <KpiCard
          title="Active Customer Growth"
          value={customers?.totalCustomers || 3241}
          growth={kpis.customerGrowth}
          trend={kpis.customerGrowth >= 0 ? 'up' : 'down'}
          icon={Users}
          className="bg-[#0c1220] border-slate-800"
        />
      </div>

      {/* Grid Dashboard Layout */}
      <div className="grid grid-cols-12 gap-6">
        {visibleWidgets.map((w) => {
          let widgetContent = null;

          switch (w.id) {
            case 'revenue_trend':
              widgetContent = (
                <ChartCard
                  title="Revenue Trend Metrics"
                  data={sales.salesTrend}
                  type="area"
                  dataKeys={['value']}
                  xKey="date"
                  height={220}
                />
              );
              break;
            case 'payment_methods':
              widgetContent = (
                <ChartCard
                  title="Payment Allocation Shares"
                  data={sales.salesByPaymentMethod}
                  type="pie"
                  height={220}
                />
              );
              break;
            case 'top_products':
              widgetContent = (
                <LeaderboardCard
                  title="Top Returned Products"
                  data={filteredProducts}
                  valueLabel="Returns"
                  metricPrefix="$"
                />
              );
              break;
            case 'top_customers':
              widgetContent = (
                <LeaderboardCard
                  title="Top Customer Tiers"
                  data={filteredCustomers}
                  className="h-full"
                />
              );
              break;
            case 'top_suppliers':
              widgetContent = (
                <LeaderboardCard
                  title="Top Vendor Purchases"
                  data={filteredSuppliers}
                  className="h-full"
                />
              );
              break;
            case 'branch_sales':
              widgetContent = (
                <ChartCard
                  title="Revenue share by Branch"
                  data={sales.salesByBranch}
                  type="bar"
                  dataKeys={['value']}
                  xKey="name"
                  height={220}
                />
              );
              break;
            case 'warehouse_value':
              widgetContent = (
                <ChartCard
                  title="Inventory Warehouses Stock"
                  data={inventory?.inventoryByWarehouse || []}
                  type="bar"
                  dataKeys={['value']}
                  xKey="name"
                  height={220}
                />
              );
              break;
          }

          return (
            <div key={w.id} className={getColSpan(w.width)}>
              {widgetContent}
            </div>
          );
        })}
      </div>

      {/* Grid customization modal dialog */}
      <Dialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
        <DialogContent className="bg-[#0c1220] border border-slate-800 text-slate-100 max-w-lg p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-black uppercase text-slate-200 tracking-wider flex items-center gap-1.5 font-sans">
              <SlidersHorizontal className="h-5 w-5 text-indigo-400" />
              <span>Customize Executive Grid</span>
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Configure layouts visibility widths, reorder layers, or save preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            {/* Widget layout managers */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">
                Active Widgets:
              </span>
              {layout
                .sort((a, b) => a.order - b.order)
                .map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 border border-slate-900 rounded-xl bg-slate-950/20 font-sans gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Move className="h-3.5 w-3.5 text-slate-600" />
                      <span className="capitalize text-xs font-bold text-slate-200 truncate max-w-[120px]">
                        {item.id.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Width selection */}
                      <select
                        value={item.width}
                        onChange={(e) => changeWidgetWidth(item.id, e.target.value as any)}
                        className="bg-[#0c1220] border border-slate-850 text-slate-350 rounded p-1 text-[10px] focus:outline-none"
                      >
                        <option value="third">1/3 Column</option>
                        <option value="half">1/2 Column</option>
                        <option value="full">Full Width</option>
                      </select>

                      {/* Move Up/Down controls */}
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={index === 0}
                        onClick={() => moveWidget(index, 'up')}
                        className="h-6 w-6 text-slate-500 hover:text-slate-200"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={index === layout.length - 1}
                        onClick={() => moveWidget(index, 'down')}
                        className="h-6 w-6 text-slate-500 hover:text-slate-200"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>

                      {/* Eye visibility toggle */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleWidgetVisibility(item.id)}
                        className="h-6 w-6 text-slate-500 hover:text-slate-200"
                      >
                        {item.visible ? (
                          <Eye className="h-3.5 w-3.5 text-emerald-450" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Actions */}
            <DialogFooter className="flex sm:justify-between items-center pt-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleResetLayout}
                  variant="outline"
                  className="h-9 border-slate-800 text-slate-400 hover:text-slate-200 bg-[#0c1220] gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Layout</span>
                </Button>
              </div>

              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={handleSaveLayout}
                  className="h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs gap-1"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Layout</span>
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

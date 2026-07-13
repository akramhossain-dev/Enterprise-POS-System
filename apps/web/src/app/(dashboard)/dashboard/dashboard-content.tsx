'use client';

import { TrendingUp, ShoppingCart, Package, Users, DollarSign, BarChart3 } from 'lucide-react';

// Layout
import { PageContainer } from '@/components/layout/page-container';

// KPI
import { KpiCard } from '@/components/dashboard/kpi-card';

// Widgets
import { WelcomeCard } from '@/components/dashboard/widgets/welcome-card';
import { RecentActivity } from '@/components/dashboard/widgets/recent-activity';
import { QuickShortcuts } from '@/components/dashboard/widgets/quick-shortcuts';
import { SystemStatus } from '@/components/dashboard/widgets/system-status';
import { RecentSales } from '@/components/dashboard/widgets/recent-sales';
import { LowStockAlert } from '@/components/dashboard/widgets/low-stock-alert';
import { PendingPayments } from '@/components/dashboard/widgets/pending-payments';
import { RecentCustomers } from '@/components/dashboard/widgets/recent-customers';

// Charts
import { ChartWrapper } from '@/components/dashboard/charts/chart-wrapper';
import { AppAreaChart } from '@/components/dashboard/charts/area-chart';
import { AppBarChart } from '@/components/dashboard/charts/bar-chart';

// Cards
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// ── Demo chart data ────────────────────────────────────────────────────────
const REVENUE_DATA = [
  { month: 'Jan', revenue: 18400, expenses: 11200 },
  { month: 'Feb', revenue: 22100, expenses: 12800 },
  { month: 'Mar', revenue: 19800, expenses: 10500 },
  { month: 'Apr', revenue: 28000, expenses: 14200 },
  { month: 'May', revenue: 24600, expenses: 13100 },
  { month: 'Jun', revenue: 31200, expenses: 15400 },
  { month: 'Jul', revenue: 29800, expenses: 14900 },
];

const WEEKLY_SALES = [
  { day: 'Mon', sales: 42 },
  { day: 'Tue', sales: 58 },
  { day: 'Wed', sales: 35 },
  { day: 'Thu', sales: 71 },
  { day: 'Fri', sales: 89 },
  { day: 'Sat', sales: 64 },
  { day: 'Sun', sales: 28 },
];

// ── Dashboard client component ────────────────────────────────────────────
export function DashboardContent() {
  return (
    <PageContainer>
      {/* ── Welcome ── */}
      <WelcomeCard />

      {/* ── KPI Grid ── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={284200}
          growth={12.4}
          trend="up"
          icon={DollarSign}
          iconColor="text-primary"
          iconBg="bg-primary/10"
          prefix="$"
          description="vs. last month"
          href="/accounting"
          animate
        />
        <KpiCard
          title="Total Sales"
          value={1842}
          growth={8.2}
          trend="up"
          icon={ShoppingCart}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
          description="orders this month"
          href="/sales"
          animate
        />
        <KpiCard
          title="Products"
          value={648}
          growth={-2.1}
          trend="down"
          icon={Package}
          iconColor="text-violet-500"
          iconBg="bg-violet-500/10"
          description="24 low stock"
          href="/inventory"
          animate
        />
        <KpiCard
          title="Customers"
          value={3241}
          growth={5.7}
          trend="up"
          icon={Users}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
          description="+38 this week"
          href="/customers"
          animate
        />
      </div>

      {/* ── Revenue Chart + Recent Sales ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Monthly revenue vs. expenses</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartWrapper height={220}>
              <AppAreaChart
                data={REVENUE_DATA}
                xKey="month"
                height={220}
                areas={[
                  { key: 'revenue', label: 'Revenue', color: 'hsl(var(--primary))' },
                  { key: 'expenses', label: 'Expenses', color: 'hsl(var(--destructive))' },
                ]}
                showLegend
              />
            </ChartWrapper>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-500" />
              Recent Sales
            </CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <RecentSales />
          </CardContent>
        </Card>
      </div>

      {/* ── Weekly Bar Chart + Quick Shortcuts ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              Weekly Orders
            </CardTitle>
            <CardDescription>Sales volume by day</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartWrapper height={200}>
              <AppBarChart
                data={WEEKLY_SALES}
                xKey="day"
                height={200}
                bars={[{ key: 'sales', label: 'Orders', color: 'hsl(var(--primary))' }]}
              />
            </ChartWrapper>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Shortcuts</CardTitle>
            <CardDescription>Fast access to key modules</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickShortcuts />
          </CardContent>
        </Card>
      </div>

      {/* ── 4-Col Widget Row ── */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <LowStockAlert />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <PendingPayments />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Customers</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RecentCustomers />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SystemStatus />
          </CardContent>
        </Card>
      </div>

      {/* ── Activity Feed ── */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivity />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

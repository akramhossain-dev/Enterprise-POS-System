import type { Metadata } from 'next';
import { LayoutDashboard, TrendingUp, ShoppingCart, Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Here&apos;s an overview of your business.
        </p>
      </div>

      {/* Placeholder KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Revenue',
            value: '—',
            change: '—',
            icon: TrendingUp,
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
          {
            title: 'Total Sales',
            value: '—',
            change: '—',
            icon: ShoppingCart,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            title: 'Inventory Items',
            value: '—',
            change: '—',
            icon: Package,
            color: 'text-violet-500',
            bg: 'bg-violet-500/10',
          },
          {
            title: 'Active Modules',
            value: 'F1',
            change: 'Foundation Phase',
            icon: LayoutDashboard,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
        ].map((kpi) => (
          <div
            key={kpi.title}
            className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{kpi.title}</span>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
          </div>
        ))}
      </div>

      {/* Phase Status */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Phase F1 — Frontend Foundation
        </h2>
        <div className="space-y-2">
          {[
            '✅ Theme System (Dark Aurora + Light Enterprise)',
            '✅ Design Tokens & Design System',
            '✅ Providers (Theme, Query, Auth, Toast)',
            '✅ Layouts (Auth, Dashboard, Error)',
            '✅ Reusable Component Library',
            '✅ Navigation (Sidebar, Navbar, Breadcrumb)',
            '✅ API Layer (Axios + TanStack Query)',
            '✅ Auth Foundation (Guards, Middleware)',
            '✅ Zustand State Management',
            '✅ Global Error Handling',
            '✅ Data Table Foundation',
            '✅ File Upload Foundation',
            '🔜 Business Modules (Phase F2+)',
          ].map((item) => (
            <p key={item} className="text-sm text-muted-foreground">
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

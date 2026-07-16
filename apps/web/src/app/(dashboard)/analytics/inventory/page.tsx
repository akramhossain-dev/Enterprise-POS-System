'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useInventoryAnalyticsStats } from '@/hooks/use-analytics';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ChartCard } from '@/components/analytics/chart-card';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-skeletons';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';

export default function InventoryAnalyticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: inventory, isLoading } = useInventoryAnalyticsStats({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  if (isLoading || !inventory) {
    return (
      <PageContainer className="max-w-7xl mx-auto py-6">
        <AnalyticsDashboardSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="text-slate-100 select-none text-left print:bg-white print:text-black">
      <div className="mb-4 print:hidden">
        <Link href="/analytics/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Executive Dashboard</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Inventory & Stock Analytics"
        description="Verify overall warehouse asset value, monitor low stock margins, and check turnover rates."
      />

      {/* Date filters */}
      <div className="flex items-center gap-1.5 bg-[#0c1220] px-3 border border-slate-850 rounded-xl text-xs h-9 w-full sm:w-auto my-6 print:hidden max-w-sm">
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

      {/* Stats summary cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <div className="bg-[#0c1220] border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-lg">
            <Package className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Total Inventory Value
            </p>
            <p className="text-lg font-black font-mono text-indigo-400">
              ${inventory.totalStockValue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-[#0c1220] border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 rounded-lg">
            <Package className="h-6 w-6 text-rose-455" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Low Stock Threshold Items
            </p>
            <p className="text-lg font-black font-mono text-rose-455">
              {inventory.lowStockItemsCount}
            </p>
          </div>
        </div>

        <div className="bg-[#0c1220] border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <Package className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Inventory Turnover Ratio
            </p>
            <p className="text-lg font-black font-mono text-emerald-400">
              {inventory.turnoverRatio}x
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Stock Value Trend"
          data={inventory.inventoryTrend}
          type="area"
          dataKeys={['value']}
          xKey="date"
          height={240}
        />
        <ChartCard
          title="Value Distribution by Warehouse"
          data={inventory.inventoryByWarehouse}
          type="pie"
          height={240}
        />
      </div>
    </PageContainer>
  );
}

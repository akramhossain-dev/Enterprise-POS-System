'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useKpisListQuery } from '@/hooks/use-bi';
import { useExecutiveDashboardStats } from '@/hooks/use-analytics';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { ChartCard } from '@/components/analytics/chart-card';
import { KpiBuilderDialog } from '@/components/bi/kpi-builder-dialog';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Sliders,
  RefreshCw,
  Star,
  Play,
  Settings,
  Plus,
  LayoutDashboard,
  Copy,
  Trash,
  FolderHeart,
} from 'lucide-react';
import { toast } from 'sonner';

interface LayoutWidget {
  id: string;
  name: string;
  type: 'kpi' | 'chart';
  width: 'half' | 'full';
  formula?: string;
  color?: string;
  value?: number;
}

const generateWidgetId = (): string => `wi-${Date.now()}`;

export default function ExecutiveBiDashboardPage() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [widgets, setWidgets] = useState<LayoutWidget[]>([
    {
      id: 'wi-1',
      name: 'Corporate Health Score',
      type: 'kpi',
      width: 'half',
      value: 84.5,
      color: 'text-emerald-450',
    },
    {
      id: 'wi-2',
      name: 'Net Profit Margin Formula',
      type: 'kpi',
      width: 'half',
      value: 36.2,
      color: 'text-indigo-400',
      formula: 'netProfit / revenue',
    },
  ]);

  const { data: kpis, isLoading } = useKpisListQuery();

  const handleSaveKpi = (newKpi: { name: string; formula: string; color: string }) => {
    const newWidget: LayoutWidget = {
      id: generateWidgetId(),
      name: newKpi.name,
      type: 'kpi',
      width: 'half',
      formula: newKpi.formula,
      color: newKpi.color,
      value: Math.floor(Math.random() * 50) + 10,
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleDuplicate = (id: string) => {
    const match = widgets.find((w) => w.id === id);
    if (!match) return;
    setWidgets([
      ...widgets,
      {
        ...match,
        id: generateWidgetId(),
        name: `${match.name} (Copy)`,
      },
    ]);
    toast.success(`Widget "${match.name}" duplicated.`);
  };

  const handleDelete = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
    toast.success('Widget removed from layout.');
  };

  if (isLoading) {
    return (
      <PageContainer className="max-w-7xl mx-auto py-6">
        <AnalyticsDashboardSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="text-foreground select-none text-left print:bg-white print:text-black">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
        <PageHeader
          title="Executive Business Intelligence (BI)"
          description="Build custom formulas KPI cards, monitor Corporate Health Indexes, and duplicate layouts."
        />

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setIsBuilderOpen(true)}
            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Create KPI Formula</span>
          </Button>
        </div>
      </div>

      {/* Corporate health index layout */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {/* Business Health Score circular card */}
        <Card className="bg-card border-border p-4 flex flex-col justify-between">
          <CardHeader className="p-0 pb-3 border-b border-border">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
              <FolderHeart className="h-4 w-4 text-emerald-450" />
              <span>Business Health Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6 flex flex-col items-center justify-center gap-2">
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-4 border-emerald-500/20">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow" />
              <span className="text-2xl font-black font-mono text-emerald-400">84.5%</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono mt-2 text-center">
              Target Level: 80% (Optimal Efficiency)
            </p>
          </CardContent>
        </Card>

        {/* Custom Widgets layout grid */}
        <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
          {widgets.map((widget) => (
            <Card
              key={widget.id}
              className="bg-card border-border p-4 flex flex-col justify-between select-none"
            >
              <div className="flex justify-between items-start border-b border-border pb-2 mb-2">
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold">
                    Custom Formula: {widget.formula || 'Static Score'}
                  </span>
                  <h4 className="text-xs font-bold text-foreground truncate mt-0.5 max-w-[150px]">
                    {widget.name}
                  </h4>
                </div>

                <div className="flex gap-1 print:hidden">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDuplicate(widget.id)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="Duplicate Widget"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(widget.id)}
                    className="h-6 w-6 text-muted-foreground hover:text-rose-500"
                    title="Delete Widget"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="py-2">
                <span
                  className={`text-2xl font-black font-mono ${widget.color || 'text-foreground'}`}
                >
                  {widget.value}%
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* KPI formulas picker dialog */}
      <KpiBuilderDialog
        isOpen={isBuilderOpen}
        onOpenChange={setIsBuilderOpen}
        onSaveKpi={handleSaveKpi}
      />
    </PageContainer>
  );
}

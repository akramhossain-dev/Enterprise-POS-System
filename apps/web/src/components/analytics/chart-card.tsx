'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const AppAreaChart = dynamic(
  () => import('@/components/dashboard/charts/area-chart').then((mod) => mod.AppAreaChart),
  {
    ssr: false,
    loading: () => <div className="h-[250px] animate-pulse bg-accent/40 rounded-xl" />,
  },
);
const AppBarChart = dynamic(
  () => import('@/components/dashboard/charts/bar-chart').then((mod) => mod.AppBarChart),
  {
    ssr: false,
    loading: () => <div className="h-[250px] animate-pulse bg-accent/40 rounded-xl" />,
  },
);
const AppLineChart = dynamic(
  () => import('@/components/dashboard/charts/line-chart').then((mod) => mod.AppLineChart),
  {
    ssr: false,
    loading: () => <div className="h-[250px] animate-pulse bg-accent/40 rounded-xl" />,
  },
);
const AppPieChart = dynamic(
  () => import('@/components/dashboard/charts/pie-chart').then((mod) => mod.AppPieChart),
  {
    ssr: false,
    loading: () => <div className="h-[250px] animate-pulse bg-accent/40 rounded-xl" />,
  },
);
import { FileDown, Printer, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ChartCardProps {
  title: string;
  description?: string;
  data: any[];
  type: 'area' | 'bar' | 'line' | 'pie';
  dataKeys?: string[]; // e.g. ['revenue', 'expenses']
  xKey?: string; // e.g. 'date'
  height?: number;
  showTimeframeSelector?: boolean;
  onTimeframeChange?: (timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  className?: string;
}

export function ChartCard({
  title,
  description,
  data,
  type,
  dataKeys = ['value'],
  xKey = 'date',
  height = 250,
  showTimeframeSelector = false,
  onTimeframeChange,
  className,
}: ChartCardProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    'daily',
  );

  const handleTimeframeChange = (time: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setActiveTimeframe(time);
    if (onTimeframeChange) {
      onTimeframeChange(time);
    }
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((item) => headers.map((h) => String(item[h]).replace(/,/g, ' ')));

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Chart data for ${title} exported to CSV successfully.`);
  };

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex h-48 items-center justify-center text-xs text-muted-foreground font-sans">
          No data available for display.
        </div>
      );
    }

    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

    switch (type) {
      case 'area':
        return (
          <AppAreaChart
            data={data}
            height={height}
            xKey={xKey}
            areas={dataKeys.map((key, i) => ({
              key,
              label: key.replace(/_/g, ' '),
              color: colors[i % colors.length] || '#10b981',
            }))}
            showLegend={dataKeys.length > 1}
          />
        );
      case 'bar':
        return (
          <AppBarChart
            data={data}
            height={height}
            xKey={xKey}
            bars={dataKeys.map((key, i) => ({
              key,
              label: key.replace(/_/g, ' '),
              color: colors[i % colors.length] || '#3b82f6',
            }))}
            showLegend={dataKeys.length > 1}
          />
        );
      case 'line':
        return (
          <AppLineChart
            data={data}
            height={height}
            xKey={xKey}
            lines={dataKeys.map((key, i) => ({
              key,
              label: key.replace(/_/g, ' '),
              color: colors[i % colors.length] || '#8b5cf6',
            }))}
            showLegend={dataKeys.length > 1}
          />
        );
      case 'pie': {
        const enrichedPieData = data.map((item, i) => ({
          name: item.name || '',
          value: item.value || 0,
          color: item.color || colors[i % colors.length] || '#10b981',
        }));
        return <AppPieChart data={enrichedPieData} height={height} showLegend={true} />;
      }
      default:
        return null;
    }
  };

  return (
    <Card className="bg-cardard border-border text-foreground flex flex-col justify-between select-none text-left print:bg-white print:text-black print:border-none print:shadow-none">
      <CardHeader className="py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:border-black">
        <div className="space-y-0.5 text-left">
          <CardTitle className="text-xs font-bold text-foreground uppercase tracking-widest font-sans flex items-center gap-1.5 print:text-black">
            <HelpCircle className="h-4 w-4 text-emerald-450 print:hidden" />
            <span>{title}</span>
          </CardTitle>
          {description && (
            <CardDescription className="text-[10px] text-muted-foreground font-mono mt-0.5 print:text-gray-600">
              {description}
            </CardDescription>
          )}
        </div>

        <div className="flex items-center gap-2 print:hidden self-end sm:self-auto">
          {/* Timeframe options */}
          {showTimeframeSelector && (
            <div className="flex border border-slate-855 rounded-lg bg-muted p-0.5 text-[9px] font-bold">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTimeframeChange(t)}
                  className={`px-2 py-1 rounded capitalize transition-colors ${
                    activeTimeframe === t
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'text-muted-foreground hover:text-muted-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Export tools */}
          <div className="flex gap-1.5">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleExportCSV}
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent border border-border"
              title="Download CSV"
            >
              <FileDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => window.print()}
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent border border-border"
              title="Print Chart"
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-6 flex-1 flex flex-col justify-center print:py-4">
        {renderChart()}
      </CardContent>
    </Card>
  );
}

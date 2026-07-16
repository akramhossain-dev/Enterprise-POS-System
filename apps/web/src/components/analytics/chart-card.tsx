'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppAreaChart } from '@/components/dashboard/charts/area-chart';
import { AppBarChart } from '@/components/dashboard/charts/bar-chart';
import { AppLineChart } from '@/components/dashboard/charts/line-chart';
import { AppPieChart } from '@/components/dashboard/charts/pie-chart';
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
        <div className="flex h-48 items-center justify-center text-xs text-slate-500 font-sans">
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
    <Card className="bg-[#0c1220] border-slate-800 text-slate-100 flex flex-col justify-between select-none text-left print:bg-white print:text-black print:border-none print:shadow-none">
      <CardHeader className="py-4 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:border-black">
        <div className="space-y-0.5 text-left">
          <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-widest font-sans flex items-center gap-1.5 print:text-black">
            <HelpCircle className="h-4 w-4 text-emerald-450 print:hidden" />
            <span>{title}</span>
          </CardTitle>
          {description && (
            <CardDescription className="text-[10px] text-slate-500 font-mono mt-0.5 print:text-gray-600">
              {description}
            </CardDescription>
          )}
        </div>

        <div className="flex items-center gap-2 print:hidden self-end sm:self-auto">
          {/* Timeframe options */}
          {showTimeframeSelector && (
            <div className="flex border border-slate-855 rounded-lg bg-slate-950 p-0.5 text-[9px] font-bold">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTimeframeChange(t)}
                  className={`px-2 py-1 rounded capitalize transition-colors ${
                    activeTimeframe === t
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'text-slate-500 hover:text-slate-350'
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
              className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-900"
              title="Download CSV"
            >
              <FileDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => window.print()}
              className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-900"
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

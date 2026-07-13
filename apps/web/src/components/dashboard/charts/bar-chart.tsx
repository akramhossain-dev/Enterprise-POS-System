'use client';

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface BarChartDataPoint {
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  bars: { key: string; label: string; color: string }[];
  xKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  radius?: number;
}

export function AppBarChart({
  data,
  bars,
  xKey = 'name',
  height = 240,
  showGrid = true,
  showLegend = false,
  radius = 4,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={4}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
            vertical={false}
          />
        )}
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'hsl(var(--popover-foreground))',
          }}
          cursor={{ fill: 'hsl(var(--accent))', opacity: 0.5 }}
        />
        {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {bars.map((bar) => (
          <Bar key={bar.key} dataKey={bar.key} name={bar.label} fill={bar.color} radius={radius} />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  );
}

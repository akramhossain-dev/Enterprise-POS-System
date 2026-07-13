'use client';

import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useId } from 'react';

export interface AreaChartDataPoint {
  [key: string]: string | number;
}

interface AreaChartProps {
  data: AreaChartDataPoint[];
  areas: { key: string; label: string; color: string }[];
  xKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stackId?: string;
}

export function AppAreaChart({
  data,
  areas,
  xKey = 'name',
  height = 240,
  showGrid = true,
  showLegend = false,
  stackId,
}: AreaChartProps) {
  const gradientId = useId();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReAreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {areas.map((area, i) => (
            <linearGradient key={area.key} id={`${gradientId}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
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
          cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
        />
        {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {areas.map((area, i) => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            name={area.label}
            stroke={area.color}
            strokeWidth={2}
            fill={`url(#${gradientId}-${i})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            stackId={stackId}
          />
        ))}
      </ReAreaChart>
    </ResponsiveContainer>
  );
}

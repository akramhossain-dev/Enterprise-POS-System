'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import type { ForecastPoint } from '@/types/bi';

interface ForecastChartProps {
  title: string;
  description?: string;
  data: ForecastPoint[];
  height?: number;
  className?: string;
}

export function ForecastChart({
  title,
  description,
  data,
  height = 240,
  className,
}: ForecastChartProps) {
  return (
    <Card className="bg-card border-border text-foreground flex flex-col justify-between select-none text-left print:bg-white print:text-black">
      <CardHeader className="py-4 border-b border-border">
        <CardTitle className="text-xs font-bold text-foreground uppercase tracking-widest font-sans">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="py-6 flex-1 flex flex-col justify-center print:py-4">
        <ResponsiveContainer width="100%" height={height}>
          <ReAreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
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
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {/* Historical Series (Solid) */}
            <Area
              type="monotone"
              dataKey="historical"
              name="Historical Data"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorHistorical)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            {/* Projected Series (Dashed) */}
            <Area
              type="monotone"
              dataKey="projected"
              name="Projected Trend"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#colorProjected)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </ReAreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

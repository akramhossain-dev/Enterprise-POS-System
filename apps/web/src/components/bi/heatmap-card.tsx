'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import type { HeatmapPoint } from '@/types/bi';

interface HeatmapCardProps {
  title: string;
  description?: string;
  data: HeatmapPoint[];
  className?: string;
}

export function HeatmapCard({ title, description, data, className }: HeatmapCardProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['09:00', '12:00', '15:00', '18:00', '21:00'];

  const getHeatColor = (val: number) => {
    if (val < 25) return 'bg-[#0f1d3a] text-slate-500';
    if (val < 50) return 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30';
    if (val < 75) return 'bg-indigo-800/40 text-indigo-200 border border-indigo-700/30';
    return 'bg-emerald-500/20 text-emerald-450 border border-emerald-500/40 font-bold';
  };

  const getVal = (day: string, hour: string) => {
    return data.find((d) => d.x === day && d.y === hour)?.value ?? 0;
  };

  return (
    <Card
      className={cn(
        'bg-[#0c1220] border-slate-800 text-slate-100 select-none text-left print:bg-white print:text-black',
        className,
      )}
    >
      <CardHeader className="py-4 border-b border-slate-900">
        <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-widest font-sans">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-[10px] text-slate-500 font-mono mt-0.5">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-8 gap-1.5 text-center font-mono text-[9px]">
          {/* Top Hours Header */}
          <div />
          {hours.map((h) => (
            <div key={h} className="text-slate-500 font-bold py-1">
              {h}
            </div>
          ))}
          <div />
          <div />

          {/* Rows */}
          {days.map((day) => (
            <React.Fragment key={day}>
              {/* Day Label */}
              <div className="text-slate-400 font-bold py-2 flex items-center justify-start text-[10px] font-sans">
                {day}
              </div>

              {/* Heat Cells */}
              {hours.map((hour) => {
                const val = getVal(day, hour);
                return (
                  <div
                    key={hour}
                    className={cn(
                      'py-2 rounded-lg flex items-center justify-center transition-all hover:scale-105',
                      getHeatColor(val),
                    )}
                    title={`Density: ${val}%`}
                  >
                    {val}%
                  </div>
                );
              })}

              <div />
              <div />
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

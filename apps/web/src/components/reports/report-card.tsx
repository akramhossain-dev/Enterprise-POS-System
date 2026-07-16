'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, FileText, ArrowRight, Clock } from 'lucide-react';
import type { ReportMetadata } from '@/types/reports';
import { cn } from '@/utils/cn';
import Link from 'next/link';

interface ReportCardProps {
  report: ReportMetadata;
  onToggleFavorite?: (id: string) => void;
  className?: string;
}

export function ReportCard({ report, onToggleFavorite, className }: ReportCardProps) {
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(report.id);
  };

  const getCategoryColor = (cat: ReportMetadata['category']) => {
    switch (cat) {
      case 'sales':
        return 'text-emerald-450 bg-emerald-500/10 border-emerald-950/20';
      case 'purchase':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-950/20';
      case 'inventory':
        return 'text-amber-500 bg-amber-500/10 border-amber-950/20';
      case 'tax':
        return 'text-rose-455 bg-rose-500/10 border-rose-950/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-950/20';
    }
  };

  return (
    <Card
      className={cn(
        'bg-[#0c1220] border-slate-800 text-slate-100 hover:border-slate-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between select-none text-left',
        className,
      )}
    >
      <CardHeader className="py-4 border-b border-slate-900 flex flex-row items-start justify-between gap-3">
        <div className="space-y-1 text-left flex-1 min-w-0">
          <span
            className={cn(
              'px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border font-sans',
              getCategoryColor(report.category),
            )}
          >
            {report.category}
          </span>
          <CardTitle className="text-sm font-bold text-slate-200 truncate mt-1">
            {report.name}
          </CardTitle>
          <CardDescription className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 min-h-[30px] font-sans leading-relaxed">
            {report.description}
          </CardDescription>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={handleToggle}
          className="h-7 w-7 text-slate-500 hover:text-amber-450 hover:bg-slate-900 border border-slate-900"
          title={report.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Star
            className={cn('h-3.5 w-3.5', report.isFavorite && 'fill-amber-450 text-amber-450')}
          />
        </Button>
      </CardHeader>

      <CardContent className="p-3 bg-slate-950/20 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>Last Run: {report.lastRun || 'Never'}</span>
        </div>

        <Link href={`/reports/${report.category}?id=${report.id}`}>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] text-emerald-450 hover:text-emerald-350 hover:bg-slate-900 gap-1"
          >
            <span>Open</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

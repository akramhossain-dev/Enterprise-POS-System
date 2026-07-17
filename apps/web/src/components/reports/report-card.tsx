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
        return 'text-muted-foreground bg-slate-500/10 border-slate-950/20';
    }
  };

  return (
    <Card
      className={cn(
        'bg-cardard border-border text-foreground hover:border-slate-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between select-none text-left',
        className,
      )}
    >
      <CardHeader className="py-4 border-b border-border flex flex-row items-start justify-between gap-3">
        <div className="space-y-1 text-left flex-1 min-w-0">
          <span
            className={cn(
              'px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border font-sans',
              getCategoryColor(report.category),
            )}
          >
            {report.category}
          </span>
          <CardTitle className="text-sm font-bold text-foreground truncate mt-1">
            {report.name}
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 min-h-[30px] font-sans leading-relaxed">
            {report.description}
          </CardDescription>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={handleToggle}
          className="h-7 w-7 text-muted-foreground hover:text-amber-450 hover:bg-accent border border-border"
          title={report.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Star
            className={cn('h-3.5 w-3.5', report.isFavorite && 'fill-amber-450 text-amber-450')}
          />
        </Button>
      </CardHeader>

      <CardContent className="p-3 bg-muted/20 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>Last Run: {report.lastRun || 'Never'}</span>
        </div>

        <Link href={`/reports/${report.category}?id=${report.id}`}>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] text-emerald-450 hover:text-emerald-350 hover:bg-accent gap-1"
          >
            <span>Open</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

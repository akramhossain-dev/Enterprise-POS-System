'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useReportsListQuery,
  useScheduledReportsQuery,
  useExportLogsQuery,
} from '@/hooks/use-reports';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ReportCard } from '@/components/reports/report-card';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-skeletons';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  Star,
  Clock,
  Calendar,
  FileText,
  ArrowRight,
  Sparkles,
  FileDown,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: reports = [], isLoading: isReportsLoading } = useReportsListQuery();
  const { data: schedules = [], isLoading: isSchedulesLoading } = useScheduledReportsQuery();
  const { data: logs = [], isLoading: isLogsLoading } = useExportLogsQuery();

  const [favorites, setFavorites] = useState<string[]>([
    'rep-sales-summary',
    'rep-current-stock',
    'rep-vat-report',
  ]);

  const handleToggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
      toast.success('Report removed from favorites.');
    } else {
      setFavorites([...favorites, id]);
      toast.success('Report marked as favorite.');
    }
  };

  if (isReportsLoading || isSchedulesLoading || isLogsLoading) {
    return (
      <PageContainer className="max-w-7xl mx-auto py-6">
        <AnalyticsDashboardSkeleton />
      </PageContainer>
    );
  }

  // Filter reports
  const enrichedReports = reports.map((rep) => ({
    ...rep,
    isFavorite: favorites.includes(rep.id),
  }));

  const filteredReports = enrichedReports.filter(
    (rep) =>
      rep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const favoriteReportsList = enrichedReports.filter((r) => r.isFavorite);

  return (
    <PageContainer className="text-foreground select-none text-left print:bg-white print:text-black">
      <PageHeader
        title="Operations Report Center"
        description="Comprehensive daily ledgers, valuation indices, vat returns worksheets, and exports scheduler."
      />

      {/* Top filter row */}
      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter available report templates by name, module, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-9 bg-muted border border-slate-855 rounded-xl text-xs focus:outline-none"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Columns: grid matching reports templates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Favorite templates */}
          {favoriteReportsList.length > 0 && searchQuery === '' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>Favorite Report Templates</span>
              </h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {favoriteReportsList.map((r) => (
                  <ReportCard key={r.id} report={r} onToggleFavorite={handleToggleFavorite} />
                ))}
              </div>
            </div>
          )}

          {/* All templates */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Available Report Registries</span>
            </h3>
            {filteredReports.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {filteredReports.map((r) => (
                  <ReportCard key={r.id} report={r} onToggleFavorite={handleToggleFavorite} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground text-xs">
                No matching report templates registered.
              </div>
            )}
          </div>
        </div>

        {/* Right columns: schedules & recently executed logs */}
        <div className="space-y-6">
          {/* Cron Schedules */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span>Scheduled Report Jobs</span>
              </h3>
              <Link href="/reports/scheduled">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 border border-border text-muted-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <Card className="bg-card border-border p-4 font-mono text-[10px] text-muted-foreground space-y-3 text-left">
              {schedules.map((sch) => (
                <div key={sch.id} className="border-b border-border pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-foreground truncate max-w-[120px]">
                      {sch.reportName}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        sch.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-950/20'
                          : 'bg-slate-500/10 text-muted-foreground border border-border/40'
                      }`}
                    >
                      {sch.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5">
                    Recurrence: {sch.frequency} at {sch.timeOfDay}
                  </p>
                </div>
              ))}
            </Card>
          </div>

          {/* Export execution history log */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-400" />
                <span>Generated Export Logs</span>
              </h3>
              <Link href="/reports/export">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] text-muted-foreground gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <Card className="bg-card border-border p-4 font-mono text-[10px] text-muted-foreground space-y-3 text-left">
              {logs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="border-b border-border pb-2 last:border-0 last:pb-0 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-foreground block truncate max-w-[130px]">
                      {log.reportName}
                    </span>
                    <span className="text-muted-foreground">{log.timestamp}</span>
                  </div>
                  <span className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-950/20 text-[8px] font-bold uppercase">
                    {log.format}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

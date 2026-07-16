'use client';

import React from 'react';
import Link from 'next/link';
import { useExportLogsQuery } from '@/hooks/use-reports';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileDown, CheckCircle } from 'lucide-react';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-skeletons';

export default function ExportCenterPage() {
  const { data: logs = [], isLoading } = useExportLogsQuery();

  if (isLoading) {
    return (
      <PageContainer className="max-w-7xl mx-auto py-6">
        <AnalyticsDashboardSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="text-slate-100 select-none text-left print:bg-white print:text-black">
      <div className="mb-4 print:hidden">
        <Link href="/reports">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Reports Center</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Export Center Registry"
        description="Verify recently generated CSV sheets, Excel files, and JSON templates logs."
      />

      <div className="mt-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans flex items-center gap-1.5">
          <FileDown className="h-4 w-4 text-indigo-400" />
          <span>Export Logs History</span>
        </h3>

        <Card className="bg-[#0c1220] border-slate-800 p-4 font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider text-[10px] pb-2">
                  <th className="py-2">Report Name</th>
                  <th className="py-2">Format</th>
                  <th className="py-2">Triggered By</th>
                  <th className="py-2">Timestamp</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-slate-350">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/20">
                    <td className="py-3 font-sans font-bold text-slate-200">{log.reportName}</td>
                    <td className="py-3">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-bold uppercase border border-indigo-950/25">
                        {log.format}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{log.generatedBy}</td>
                    <td className="py-3">{log.timestamp}</td>
                    <td className="py-3 text-right">
                      <span className="flex items-center justify-end gap-1 text-emerald-450 text-[10px] font-bold">
                        <CheckCircle className="h-3 w-3" />
                        <span>Completed</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

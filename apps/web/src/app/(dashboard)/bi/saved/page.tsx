'use client';

import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard, CheckCircle } from 'lucide-react';

export default function SavedDashboardsPage() {
  const dummySaved = [
    {
      id: 'dash-1',
      name: 'HQ Executive View',
      widgets: 6,
      createdBy: 'admin@epos.com',
      time: '2026-07-16 11:20:44',
    },
    {
      id: 'dash-2',
      name: 'Finance Operating Ledger Layout',
      widgets: 4,
      createdBy: 'finance-manager@epos.com',
      time: '2026-07-15 16:45:00',
    },
  ];

  return (
    <PageContainer className="text-foreground select-none text-left print:bg-white print:text-black">
      <div className="mb-4 print:hidden">
        <Link href="/bi">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>BI Dashboard</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Saved Dashboards Configurations"
        description="Verify saved dashboard templates, active columns groupings, and cached configurations layouts."
      />

      <div className="mt-6 space-y-4 print:hidden">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
          <LayoutDashboard className="h-4 w-4 text-indigo-400" />
          <span>Saved Executive Layouts</span>
        </h3>

        <Card className="bg-cardard border-border p-4 font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px] pb-2">
                  <th className="py-2">Dashboard Template</th>
                  <th className="py-2 text-right">Active Widgets</th>
                  <th className="py-2">Created By</th>
                  <th className="py-2">Timestamp</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-muted-foreground">
                {dummySaved.map((dash) => (
                  <tr key={dash.id} className="hover:bg-muted/20">
                    <td className="py-3 font-sans font-bold text-foreground">{dash.name}</td>
                    <td className="py-3 text-right text-emerald-450">{dash.widgets} Widgets</td>
                    <td className="py-3 text-muted-foreground">{dash.createdBy}</td>
                    <td className="py-3">{dash.time}</td>
                    <td className="py-3 text-right">
                      <span className="flex items-center justify-end gap-1 text-emerald-450 text-[10px] font-bold">
                        <CheckCircle className="h-3 w-3" />
                        <span>Active</span>
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

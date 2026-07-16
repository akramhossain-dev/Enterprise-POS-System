'use client';

import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';

export default function PrintCenterPage() {
  const dummySpools = [
    {
      id: 'spool-1',
      name: 'Invoice Receipt #INV-9081',
      size: 'Roll Paper (80mm)',
      status: 'Printed',
      time: '2026-07-16 11:22:15',
    },
    {
      id: 'spool-2',
      name: 'Sales Summary Report (July)',
      size: 'A4 Portrait',
      status: 'Printed',
      time: '2026-07-16 09:14:10',
    },
  ];

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
        title="Print Spooler Center"
        description="Verify printing setups, local roll sizes (80mm vs. A4 sheets), and printed queues registries."
      />

      <div className="mt-6 space-y-4 print:hidden">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans flex items-center gap-1.5">
          <Printer className="h-4 w-4 text-indigo-400" />
          <span>Completed Print Spools</span>
        </h3>

        <Card className="bg-[#0c1220] border-slate-800 p-4 font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider text-[10px] pb-2">
                  <th className="py-2">Document</th>
                  <th className="py-2">Form Factor Size</th>
                  <th className="py-2">Timestamp</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-slate-350">
                {dummySpools.map((spool) => (
                  <tr key={spool.id} className="hover:bg-slate-950/20">
                    <td className="py-3 font-sans font-bold text-slate-200">{spool.name}</td>
                    <td className="py-3 text-slate-400">{spool.size}</td>
                    <td className="py-3">{spool.time}</td>
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

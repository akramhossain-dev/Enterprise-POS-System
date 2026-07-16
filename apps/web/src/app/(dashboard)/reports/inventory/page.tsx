'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { ReportViewer } from '@/components/reports/report-viewer';
import { ArrowLeft } from 'lucide-react';

export default function InventoryReportsPage() {
  const searchParams = useSearchParams();
  const activeReportId = searchParams.get('id') || 'rep-current-stock';

  const reportNames: Record<string, string> = {
    'rep-current-stock': 'Current Stock Asset Valuation',
    'rep-low-stock': 'Low Stock Alert Registry',
  };

  const name = reportNames[activeReportId] || 'Current Stock Asset Valuation';

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

      <ReportViewer
        reportId={activeReportId}
        reportName={name}
        category="inventory"
        showWarehouseSelector={true}
        showCategorySelector={true}
      />
    </PageContainer>
  );
}

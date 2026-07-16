'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { ReportViewer } from '@/components/reports/report-viewer';
import { ArrowLeft } from 'lucide-react';

export default function SalesReportsPage() {
  const searchParams = useSearchParams();
  const activeReportId = searchParams.get('id') || 'rep-sales-summary';

  const reportNames: Record<string, string> = {
    'rep-sales-summary': 'Sales Summary Ledger Report',
    'rep-sales-product': 'Product Sales Volume Report',
    'rep-sales-category': 'Product Category Distribution Report',
  };

  const name = reportNames[activeReportId] || 'Sales Summary Ledger Report';

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
        category="sales"
        showBranchSelector={true}
        showWarehouseSelector={true}
        showCustomerSelector={true}
        showEmployeeSelector={true}
        showCategorySelector={true}
      />
    </PageContainer>
  );
}

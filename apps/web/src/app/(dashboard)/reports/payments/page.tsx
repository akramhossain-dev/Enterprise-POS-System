'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { ReportViewer } from '@/components/reports/report-viewer';
import { ArrowLeft } from 'lucide-react';

export default function PaymentReportsPage() {
  const searchParams = useSearchParams();
  const activeReportId = searchParams.get('id') || 'rep-payments-summary';

  const reportNames: Record<string, string> = {
    'rep-payments-summary': 'Payment Method Allocation Summary',
  };

  const name = reportNames[activeReportId] || 'Payment Method Allocation Summary';

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
        category="payments"
        showBranchSelector={true}
      />
    </PageContainer>
  );
}

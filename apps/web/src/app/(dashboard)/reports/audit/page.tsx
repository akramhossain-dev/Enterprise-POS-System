'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { ReportViewer } from '@/components/reports/report-viewer';
import { ArrowLeft } from 'lucide-react';

export default function AuditReportsPage() {
  const searchParams = useSearchParams();
  const activeReportId = searchParams.get('id') || 'rep-audit-log';

  const reportNames: Record<string, string> = {
    'rep-audit-log': 'Compliance Security Activity Trails',
  };

  const name = reportNames[activeReportId] || 'Compliance Security Activity Trails';

  return (
    <PageContainer className="text-foreground select-none text-left print:bg-white print:text-black">
      <div className="mb-4 print:hidden">
        <Link href="/reports">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Reports Center</span>
          </Button>
        </Link>
      </div>

      <ReportViewer
        reportId={activeReportId}
        reportName={name}
        category="audit"
        showEmployeeSelector={true}
      />
    </PageContainer>
  );
}

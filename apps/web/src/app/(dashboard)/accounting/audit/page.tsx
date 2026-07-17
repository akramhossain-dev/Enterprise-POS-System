'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuditTrail } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AuditTimeline } from '@/components/accounting/audit-timeline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, ShieldCheck } from 'lucide-react';

export default function AuditReportsPage() {
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch compliance logs
  const { data: logData, isLoading } = useAuditTrail({
    q: query || undefined,
    module: moduleFilter === 'ALL' ? undefined : moduleFilter,
    page: currentPage,
    limit: 20,
  });

  const logs = logData?.data || [];
  const meta = logData?.meta;

  return (
    <PageContainer className="text-foreground select-none text-left">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/accounting">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Accounting Dashboard</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Compliance Audit Trails"
        description="Monitor user adjustments, audit fiscal year locking parameters, and verify general account adjustments."
      />

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4 mb-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search actor or description..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 bg-muted border-border text-foreground text-xs focus-visible:ring-emerald-500 h-9"
            />
          </div>

          {/* Module filter selection */}
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-card border border-border text-muted-foreground rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[140px]"
          >
            <option value="ALL">All Modules</option>
            <option value="JOURNAL">Journals</option>
            <option value="INCOME">Income Book</option>
            <option value="EXPENSE">Expense Book</option>
            <option value="VOUCHER">Vouchers</option>
            <option value="TAX">Tax Configuration</option>
            <option value="PERIOD">Fiscal Calendars</option>
            <option value="CLOSING">Closures</option>
          </select>
        </div>
      </div>

      {/* Audit Timeline Grid Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: timeline listing */}
        <div className="md:col-span-2">
          <Card className="bg-card border-border p-6">
            <AuditTimeline logs={logs} loading={isLoading} />
          </Card>
        </div>

        {/* Right Column: details sidebar */}
        <div className="md:col-span-1">
          <Card className="bg-card border-border text-foreground p-4 space-y-4">
            <div className="border-b border-border pb-2">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-sans flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-450" />
                <span>Security Guidelines</span>
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground text-left font-sans">
              <p>
                Compliance audit trails log adjustments made across corporate financial ledgers.
              </p>
              <p>
                All entries are recorded alongside IP addresses, timestamps, actor accounts, and
                modular classifications to ensure corporate traceability.
              </p>
              <p className="text-[10px] text-muted-foreground italic">
                Logs are read-only and cannot be updated or cleared, complying with financial audit
                regulations.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

// Inline styling helpers
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

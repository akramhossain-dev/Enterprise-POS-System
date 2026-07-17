'use client';

import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { CashDrawerCard } from '@/components/pos/cash-drawer-card';
import { ArrowLeft } from 'lucide-react';

export default function POSCashDrawerPage() {
  return (
    <PageContainer className="max-w-6xl mx-auto py-6 text-foreground select-none text-left">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/pos">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to POS Terminal</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Cash Drawer Shift Manager"
        description="Verify starting floats, manage Cash-In / Cash-Out transactions, and close terminal shifts."
      />

      <div className="mt-6">
        <CashDrawerCard />
      </div>
    </PageContainer>
  );
}

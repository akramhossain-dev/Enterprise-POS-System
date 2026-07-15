'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useTransactionDetails } from '@/hooks/use-checkout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ReceiptViewer } from '@/components/pos/receipt-viewer';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Params {
  id: string;
}

export default function ReceiptPreviewPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const { data: transaction, isLoading, isError } = useTransactionDetails(id);

  return (
    <PageContainer className="max-w-4xl mx-auto py-6 text-slate-100 select-none text-left">
      {/* Back navigation */}
      <div className="mb-4">
        <Link href="/pos/receipts">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Receipts History</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Thermal Ticket Preview"
        description="Review thermal ticket structure, swap width dimensions, and execute printer output test."
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            <p className="text-xs">Loading receipt data...</p>
          </div>
        ) : isError || !transaction ? (
          <div className="text-center py-20 border border-dashed border-slate-850 rounded-2xl text-rose-400 text-xs">
            Failed to load receipt details. Transaction might be absent.
          </div>
        ) : (
          <ReceiptViewer transaction={transaction} />
        )}
      </div>
    </PageContainer>
  );
}

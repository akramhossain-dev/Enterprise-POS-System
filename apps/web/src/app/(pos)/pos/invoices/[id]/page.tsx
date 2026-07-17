'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useTransactionDetails } from '@/hooks/use-checkout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { InvoiceViewer } from '@/components/pos/invoice-viewer';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Params {
  id: string;
}

export default function InvoicePreviewPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const { data: transaction, isLoading, isError } = useTransactionDetails(id);

  return (
    <PageContainer className="max-w-4xl mx-auto py-6 text-foreground select-none text-left">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/pos/payments">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Payments History</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="A4 Invoice Preview"
        description="Review standard company invoice page layouts, download invoice copies, or print copies."
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            <p className="text-xs">Loading invoice sheet details...</p>
          </div>
        ) : isError || !transaction ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl text-rose-400 text-xs">
            Failed to load invoice details. Transaction might be absent.
          </div>
        ) : (
          <InvoiceViewer transaction={transaction} />
        )}
      </div>
    </PageContainer>
  );
}

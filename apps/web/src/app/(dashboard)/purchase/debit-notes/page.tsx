'use client';

import * as React from 'react';
import Link from 'next/link';
import { FileText, RefreshCw, Search, Printer, Download } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { useSupplierDebitNotes } from '@/hooks/use-purchase-return';
import { useSuppliers } from '@/hooks/use-supplier';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import type { SupplierDebitNote } from '@/types/purchase-return';
import type { ColumnDef } from '@tanstack/react-table';

export default function DebitNotesPage() {
  const [q, setQ] = React.useState('');
  const [supplierId, setSupplierId] = React.useState('');
  const [status, setStatus] = React.useState<'DRAFT' | 'ISSUED' | 'VOID' | 'APPLIED' | 'ALL'>(
    'ALL',
  );
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = useSupplierDebitNotes({
    page,
    limit: pageSize,
    q,
    supplierId,
    status,
  });

  const { data: supplierResponse } = useSuppliers({ page: 1, limit: 100 });

  const debitNotes = response?.data || [];
  const totalCount = response?.meta?.total ?? 0;
  const suppliers = supplierResponse?.data || [];

  React.useEffect(() => {
    setPage(1);
  }, [q, supplierId, status]);

  const handlePrint = (dnObj: SupplierDebitNote) => {
    toast.success(`Printing Debit Note: ${dnObj.debitNoteNumber}`);
  };

  const handleExport = () => {
    toast.info('Exporting debit notes...');
  };

  const columns: ColumnDef<SupplierDebitNote>[] = [
    {
      accessorKey: 'debitNoteNumber',
      header: 'Debit Note Number',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          {row.getValue('debitNoteNumber')}
        </span>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {row.original.supplier?.companyName || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'referenceReturnNumber',
      header: 'Reference Return',
      cell: ({ row }) => (
        <Link
          href={`/purchase/returns/${row.original.referenceReturnId}`}
          className="font-mono font-bold text-primary hover:underline text-xs"
        >
          {row.getValue('referenceReturnNumber')}
        </Link>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Deducted Amount</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono font-bold text-amber-500">
          ${Number(row.getValue('amount')).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const val = row.getValue('status') as string;
        const styles = {
          DRAFT: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
          ISSUED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          VOID: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
          APPLIED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        };
        return (
          <Badge
            variant="outline"
            className={cn(
              'rounded-full font-semibold px-2 py-0.5',
              styles[val as keyof typeof styles],
            )}
          >
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }) => <span>{new Date(row.getValue('issueDate')).toLocaleDateString()}</span>,
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => handlePrint(row.original)}
            title="Print Debit Note"
          >
            <Printer className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Supplier Debit Notes Ledger"
        description="Monitor invoice deductions and charge-back adjustments generated from approved returns."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="shadow-sm border-border bg-card mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-sm">
            {/* Search Box */}
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search debit note number, return number..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9 h-9 border-border bg-card text-foreground"
              />
            </div>

            {/* Supplier Selector */}
            <div>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full text-xs rounded-lg border border-border bg-card p-2 h-9 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs rounded-lg border border-border bg-card p-2 h-9 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="ISSUED">Issued</option>
                <option value="VOID">Void</option>
                <option value="APPLIED">Applied</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debit notes table */}
      <DataTable
        columns={columns}
        data={debitNotes}
        loading={isLoading}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyTitle="No Debit Notes Found"
        emptyDescription="Supplier debit notes will automatically generate when returns settle under refund terms."
      />
    </PageContainer>
  );
}

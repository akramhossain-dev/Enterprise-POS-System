'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Warehouse as WarehouseIcon,
  FileDown,
  Building2,
} from 'lucide-react';
import { usePurchaseRequisitions } from '@/hooks/use-purchase';
import { useWarehouses } from '@/hooks/use-warehouse';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/inventory/loading-skeleton';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/purchase/status-badge';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  PurchaseRequisition,
  PurchaseRequisitionPriority,
  PurchaseRequisitionStatus,
} from '@/types/purchase';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export default function PurchaseRequisitionsPage() {
  const [q, setQ] = React.useState('');
  const [priorityFilter, setPriorityFilter] = React.useState<PurchaseRequisitionPriority | 'ALL'>(
    'ALL',
  );
  const [statusFilter, setStatusFilter] = React.useState<PurchaseRequisitionStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [showFilters, setShowFilters] = React.useState(false);

  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = usePurchaseRequisitions({
    page,
    limit: pageSize,
    q: q || undefined,
    priority: priorityFilter,
    status: statusFilter,
  });

  const requisitions = response?.data || [];
  const totalCount = response?.meta?.total ?? 0;

  const handleExport = () => {
    toast.info('Exporting purchase requisitions list (UI Only)...');
  };

  const columns: ColumnDef<PurchaseRequisition>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Request Date',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      id: 'title',
      header: 'Title / Subject',
      cell: ({ row }) => (
        <div className="flex flex-col font-medium max-w-xs">
          <span className="font-semibold text-foreground text-sm truncate">
            {row.original.title}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Dept: {row.original.department} | By: {row.original.requestedBy}
          </span>
        </div>
      ),
    },
    {
      id: 'warehouse',
      header: 'Destination Depot',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-foreground">
          <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
          {row.original.warehouseName}
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <StatusBadge status={row.original.priority} />,
    },
    {
      accessorKey: 'subtotal',
      header: 'Requisition Cost',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          ${Number(row.original.subtotal).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Workflow Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link href={`/purchase/requisitions/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
            <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href="/purchase">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            &larr; Back to Dashboard
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Purchase Requisitions Directory"
        description="Oversee, create, and approve corporate item requisitions submitted by company departments before generating vendor PO orders."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <FileDown className="w-4 h-4" /> Export Requisitions
            </Button>
            <Link href="/purchase/requisitions/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> New Requisition
              </Button>
            </Link>
          </div>
        }
      />

      {/* Toolbar filters */}
      <div className="bg-cardard border rounded-xl p-4 mb-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search title, counter, or vendor name..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-muted/20 border-border"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn('gap-1.5', showFilters && 'bg-muted')}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {(priorityFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
            {(q || priorityFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-9"
                onClick={() => {
                  setQ('');
                  setPriorityFilter('ALL');
                  setStatusFilter('ALL');
                }}
              >
                Clear all
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Priority Level
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Workflow Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full text-sm rounded-lg border border-border bg-cardard p-2 text-foreground focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="CONVERTED">PO GENERATED</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid list */}
      {isLoading ? (
        <TableSkeleton columns={7} rows={pageSize} />
      ) : (
        <div className="bg-cardard border rounded-xl shadow-sm p-4">
          <DataTable
            columns={columns}
            data={requisitions}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyTitle="No purchase requisitions found"
            emptyDescription="Create purchase requisitions to file department replenishment requests."
          />
        </div>
      )}
    </PageContainer>
  );
}

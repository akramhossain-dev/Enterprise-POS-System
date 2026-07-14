'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  RotateCcw,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  MoreVertical,
  Archive,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useCustomers, useRestoreCustomer, useDeleteCustomer } from '@/hooks/use-customer';
import { DataTable } from '@/components/data-table/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { CustomerAvatar } from '@/components/customer/customer-avatar';
import { CustomerDueBadge } from '@/components/customer/customer-due-badge';
import { formatDate } from '@/utils/format';
import type { Customer } from '@/types/customer';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

export default function ArchivedCustomersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [q, setQ] = useState('');
  const [selectedRows, setSelectedRows] = useState<Customer[]>([]);

  const { data, isLoading, refetch, isFetching, isError, error } = useCustomers({
    page,
    limit: pageSize,
    q: q || undefined,
    status: 'ARCHIVED',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { mutate: restoreCustomer } = useRestoreCustomer();
  const { mutate: deleteCustomer } = useDeleteCustomer();

  const handleBulkRestore = () => {
    if (!selectedRows.length) return;
    let done = 0;
    selectedRows.forEach((row) => {
      restoreCustomer(row.id, {
        onSuccess: () => {
          if (++done === selectedRows.length) {
            toast.success(`Restored ${selectedRows.length} customer(s)`);
            setSelectedRows([]);
          }
        },
      });
    });
  };

  const handleBulkDelete = () => {
    if (!selectedRows.length) return;
    if (!confirm(`Permanently delete ${selectedRows.length} archived customer(s)?`)) return;
    let done = 0;
    selectedRows.forEach((row) => {
      deleteCustomer(row.id, {
        onSuccess: () => {
          if (++done === selectedRows.length) {
            toast.success(`Deleted ${selectedRows.length} customer(s)`);
            setSelectedRows([]);
          }
        },
      });
    });
  };

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            aria-label="Select all"
            className="rounded border-input text-primary focus:ring-ring"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            aria-label={`Select ${row.original.fullName}`}
            className="rounded border-input text-primary focus:ring-ring"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
      },
      {
        id: 'name',
        header: 'Customer',
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center gap-3 min-w-0">
              <CustomerAvatar customer={c} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{c.fullName}</p>
                <p className="text-[10px] text-muted-foreground font-mono">#{c.customerCode}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => <span className="text-sm font-mono">{row.original.phone || '—'}</span>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.email || '—'}</span>
        ),
      },
      {
        id: 'due',
        header: 'Due',
        cell: ({ row }) => <CustomerDueBadge balance={row.original.currentBalance} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${c.fullName}`}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    className="z-[1060] min-w-[150px] bg-popover border border-border rounded-lg p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        href={`/customers/${c.id}`}
                        className="flex items-center gap-2 px-2.5 py-2 text-xs rounded hover:bg-accent cursor-pointer outline-none"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Profile
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => restoreCustomer(c.id)}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs rounded hover:bg-accent text-success cursor-pointer outline-none"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-border my-1" />
                    <DropdownMenu.Item
                      onSelect={() => {
                        if (confirm(`Permanently delete "${c.fullName}"?`)) deleteCustomer(c.id);
                      }}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs rounded hover:bg-accent text-destructive cursor-pointer outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          );
        },
      },
    ],
    [router, restoreCustomer, deleteCustomer],
  );

  return (
    <PageContainer>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/customers">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Back to customers</span>
      </div>

      <PageHeader
        title="Archived Customers"
        description="Restore or permanently delete archived customer profiles."
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 bg-card border border-border p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 w-full sm:max-w-md relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search archived customers…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 rounded-lg pl-9 pr-4 bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search archived customers"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void refetch()}
            loading={isFetching}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>

        {/* Bulk actions */}
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-sm font-semibold text-primary">
              {selectedRows.length} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={handleBulkRestore}
                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-success" />}
                className="text-success border-success/20 hover:bg-success/10"
              >
                Restore
              </Button>
              <Button
                size="xs"
                variant="destructive"
                onClick={handleBulkDelete}
                leftIcon={<Trash2 className="w-3 h-3" />}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {isError && (
        <div className="border border-destructive/20 rounded-xl bg-destructive/5 p-4 text-sm text-destructive flex items-center justify-between">
          <span>
            Error loading archived customers: {(error as any)?.message || 'Unknown error.'}
          </span>
          <Button
            size="xs"
            variant="outline"
            onClick={() => void refetch()}
            leftIcon={<RefreshCw className="w-3 h-3" />}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        totalCount={data?.meta?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        enableRowSelection
        onRowSelectionChange={setSelectedRows}
        emptyTitle="No archived customers"
        emptyDescription="Archived customers will appear here."
      />
    </PageContainer>
  );
}

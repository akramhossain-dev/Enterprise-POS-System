'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  RefreshCw,
  Archive,
  Trash2,
  Eye,
  Edit,
  RotateCcw,
  Download,
  SlidersHorizontal,
  MoreVertical,
  Users,
  CheckCheck,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  useCustomers,
  useDeleteCustomer,
  useArchiveCustomer,
  useUpdateCustomer,
} from '@/hooks/use-customer';
import { DataTable } from '@/components/data-table/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerAvatar } from '@/components/customer/customer-avatar';
import { CustomerStatusBadge } from '@/components/customer/customer-status-badge';
import { CustomerDueBadge } from '@/components/customer/customer-due-badge';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Customer, CustomerStatus, CustomerFilterParams } from '@/types/customer';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

export default function CustomersPage() {
  const router = useRouter();

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<CustomerStatus | ''>('ACTIVE');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<CustomerFilterParams['sortBy']>('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Customer[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    customer: Customer;
  } | null>(null);

  const params: CustomerFilterParams = {
    page,
    limit: pageSize,
    q: q || undefined,
    status: status || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, refetch, isFetching, isError, error } = useCustomers(params);
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const { mutate: archiveCustomer } = useArchiveCustomer();
  const { mutate: updateCustomer } = useUpdateCustomer();

  // Bulk helpers
  const handleBulkArchive = () => {
    if (!selectedRows.length) return;
    let done = 0;
    selectedRows.forEach((row) => {
      archiveCustomer(row.id, {
        onSuccess: () => {
          if (++done === selectedRows.length) {
            toast.success(`Archived ${selectedRows.length} customer(s)`);
            setSelectedRows([]);
          }
        },
      });
    });
  };

  const handleBulkDelete = () => {
    if (!selectedRows.length) return;
    if (!confirm(`Permanently delete ${selectedRows.length} customer(s)?`)) return;
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

  const handleBulkActivate = () => {
    if (!selectedRows.length) return;
    let done = 0;
    selectedRows.forEach((row) => {
      updateCustomer(
        { id: row.id, payload: { status: 'ACTIVE' } },
        {
          onSuccess: () => {
            if (++done === selectedRows.length) {
              toast.success(`Activated ${selectedRows.length} customer(s)`);
              setSelectedRows([]);
            }
          },
        },
      );
    });
  };

  const handleContextMenu = (e: React.MouseEvent, customer: Customer) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, customer });
  };

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      // Select column
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            aria-label="Select all customers"
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
      // Name
      {
        id: 'name',
        header: 'Customer',
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center gap-3 min-w-0">
              <CustomerAvatar customer={c} size="sm" />
              <div className="min-w-0">
                <button
                  className="block text-sm font-semibold text-foreground hover:text-primary truncate"
                  onClick={() => router.push(`/customers/${c.id}`)}
                >
                  {c.fullName}
                </button>
                <p className="text-[10px] text-muted-foreground font-mono">#{c.customerCode}</p>
              </div>
            </div>
          );
        },
      },
      // Phone
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => <span className="text-sm font-mono">{row.original.phone || '—'}</span>,
      },
      // Email
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground truncate max-w-[180px] block">
            {row.original.email || '—'}
          </span>
        ),
      },
      // Address
      {
        id: 'address',
        header: 'Address',
        cell: ({ row }) => {
          const addr =
            row.original.addresses?.find((a) => a.isDefault) ?? row.original.addresses?.[0];
          if (!addr) return <span className="text-muted-foreground">—</span>;
          return (
            <span className="text-sm text-muted-foreground">
              {[addr.city, addr.country].filter(Boolean).join(', ') || addr.addressLine1}
            </span>
          );
        },
      },
      // Total Purchase (placeholder)
      {
        id: 'totalPurchase',
        header: 'Total Purchase',
        cell: () => <span className="text-sm text-muted-foreground">—</span>,
      },
      // Total Paid (placeholder)
      {
        id: 'totalPaid',
        header: 'Total Paid',
        cell: () => <span className="text-sm text-muted-foreground">—</span>,
      },
      // Due Amount
      {
        id: 'due',
        header: 'Due',
        cell: ({ row }) => <CustomerDueBadge balance={row.original.currentBalance} />,
      },
      // Status
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <CustomerStatusBadge status={row.original.status} />,
      },
      // Created
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      // Actions
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
                    className="z-[1060] min-w-[160px] bg-popover border border-border rounded-lg p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
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
                    <DropdownMenu.Item asChild>
                      <Link
                        href={`/customers/${c.id}/edit`}
                        className="flex items-center gap-2 px-2.5 py-2 text-xs rounded hover:bg-accent cursor-pointer outline-none"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit Customer
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-border my-1" />
                    <DropdownMenu.Item
                      onSelect={() => archiveCustomer(c.id)}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs rounded hover:bg-accent text-amber-500 cursor-pointer outline-none"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Archive
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => {
                        if (confirm(`Delete "${c.fullName}"? This cannot be undone.`))
                          deleteCustomer(c.id);
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
    [router, archiveCustomer, deleteCustomer],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Customers"
        description="Manage your customer base, accounts, and due history."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/customers/archive" className="inline-flex items-center gap-1.5">
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/customers/new" className="inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Add Customer</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div
        className="flex flex-col gap-3 bg-cardard border border-border p-4 rounded-xl"
        onClick={() => setContextMenu(null)}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="flex flex-1 items-center gap-2 w-full sm:max-w-md relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="customer-search"
              placeholder="Search by name, phone, email, or ID…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 rounded-lg pl-9 pr-4 bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Search customers"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters((p) => !p)}
              leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
              aria-expanded={showFilters}
              aria-controls="customer-filters"
            >
              Filters
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void refetch()}
              loading={isFetching}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              aria-label="Refresh customer list"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div
            id="customer-filters"
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-border"
          >
            <div className="space-y-1">
              <label
                htmlFor="filter-status"
                className="text-[10px] font-semibold text-muted-foreground uppercase"
              >
                Status
              </label>
              <select
                id="filter-status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as CustomerStatus | '');
                  setPage(1);
                }}
                className="w-full h-8 rounded-lg bg-background border border-border text-xs px-2.5 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="filter-sort"
                className="text-[10px] font-semibold text-muted-foreground uppercase"
              >
                Sort By
              </label>
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as CustomerFilterParams['sortBy'])}
                className="w-full h-8 rounded-lg bg-background border border-border text-xs px-2.5 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="createdAt">Date Created</option>
                <option value="fullName">Name</option>
                <option value="currentBalance">Balance</option>
              </select>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="filter-date-from"
                className="text-[10px] font-semibold text-muted-foreground uppercase"
              >
                From Date
              </label>
              <input
                id="filter-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="w-full h-8 rounded-lg bg-background border border-border text-xs px-2.5 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="filter-date-to"
                className="text-[10px] font-semibold text-muted-foreground uppercase"
              >
                To Date
              </label>
              <input
                id="filter-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="w-full h-8 rounded-lg bg-background border border-border text-xs px-2.5 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Bulk actions strip */}
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/20 mt-1">
            <span className="text-sm font-semibold text-primary">
              {selectedRows.length} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={handleBulkActivate}
                leftIcon={<CheckCheck className="w-3.5 h-3.5 text-success" />}
                className="text-success border-success/20 hover:bg-success/10"
              >
                Activate
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={handleBulkArchive}
                leftIcon={<Archive className="w-3.5 h-3.5 text-amber-500" />}
                className="text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
              >
                Archive
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

      {/* Error state */}
      {isError && (
        <div className="border border-destructive/20 rounded-xl bg-backgroundestructive/5 p-4 text-sm text-destructive flex items-center justify-between">
          <span>Error loading customers: {(error as any)?.message || 'Unknown error.'}</span>
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

      {/* DataTable */}
      <div
        onContextMenu={(e) => {
          const tr = (e.target as HTMLElement).closest('tr');
          if (tr) {
            const rowIndex = tr.rowIndex - 1;
            if (data?.data?.[rowIndex]) {
              handleContextMenu(e, data.data[rowIndex]!);
            }
          }
        }}
        onClick={() => setContextMenu(null)}
      >
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
          emptyTitle="No customers found"
          emptyDescription="Add your first customer to get started."
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          role="menu"
          className="fixed z-[9999] rounded-xl border border-border bg-popover p-1.5 shadow-xl w-48 animate-in fade-in-0 zoom-in-95"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-xs h-8"
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            onClick={() => {
              setContextMenu(null);
              router.push(`/customers/${contextMenu.customer.id}`);
            }}
          >
            View Profile
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-xs h-8"
            leftIcon={<Edit className="w-3.5 h-3.5" />}
            onClick={() => {
              setContextMenu(null);
              router.push(`/customers/${contextMenu.customer.id}/edit`);
            }}
          >
            Edit Customer
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-xs h-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
            leftIcon={<Archive className="w-3.5 h-3.5" />}
            onClick={() => {
              setContextMenu(null);
              archiveCustomer(contextMenu.customer.id);
            }}
          >
            Archive
          </Button>
          <hr className="my-1 border-border" />
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-xs h-8 text-destructive hover:bg-backgroundestructive/10"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => {
              setContextMenu(null);
              if (confirm(`Delete "${contextMenu.customer.fullName}"?`)) {
                deleteCustomer(contextMenu.customer.id);
              }
            }}
          >
            Delete Customer
          </Button>
        </div>
      )}
    </PageContainer>
  );
}

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
  FileDown,
  History,
} from 'lucide-react';
import { useUnitsList, useArchiveUnit, useDeleteUnit } from '@/hooks/use-catalog';
import { DataTable } from '@/components/data-table/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Unit } from '@/types/product';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

export default function UnitsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | ''>('ACTIVE');
  const [selectedRows, setSelectedRows] = useState<Unit[]>([]);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  const {
    data: unitsData,
    isLoading,
    refetch,
    isFetching,
  } = useUnitsList({
    page,
    limit: pageSize,
    q: q || undefined,
    status: status || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const units = unitsData?.data ?? [];
  const totalCount = unitsData?.meta?.total ?? 0;

  const { mutate: archiveUnit } = useArchiveUnit();
  const { mutate: deleteUnit } = useDeleteUnit();

  const handleBulkArchive = () => {
    if (selectedRows.length === 0) return;
    let count = 0;
    selectedRows.forEach((row) => {
      archiveUnit(row.id, {
        onSuccess: () => {
          count++;
          if (count === selectedRows.length) {
            toast.success(`Successfully archived ${selectedRows.length} units`);
            setSelectedRows([]);
            void refetch();
          }
        },
      });
    });
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (
      confirm(`Permanently delete ${selectedRows.length} selected units? This cannot be undone.`)
    ) {
      let count = 0;
      selectedRows.forEach((row) => {
        deleteUnit(row.id, {
          onSuccess: () => {
            count++;
            if (count === selectedRows.length) {
              toast.success(`Successfully deleted ${selectedRows.length} units`);
              setSelectedRows([]);
              void refetch();
            }
          },
        });
      });
    }
  };

  // Find parent/base unit name helper
  const getBaseUnitName = (baseUnitId?: string | null) => {
    if (!baseUnitId) return 'None (Base Unit)';
    const parent = units.find((u) => u.id === baseUnitId);
    return parent ? `${parent.name} (${parent.shortName})` : 'Base Unit';
  };

  // Columns definition for DataTable
  const columns = useMemo<ColumnDef<Unit>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            className="rounded border-input text-primary focus:ring-ring"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            className="rounded border-input text-primary focus:ring-ring"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Unit Name',
        cell: ({ row }) => (
          <div
            className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
            onClick={() => router.push(`/products/units/${row.original.id}`)}
          >
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: 'shortName',
        header: 'Short Name',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold">{row.original.shortName}</span>
        ),
      },
      {
        id: 'baseUnit',
        header: 'Base Unit',
        cell: ({ row }) => getBaseUnitName(row.original.baseUnitId),
      },
      {
        accessorKey: 'conversionRatio',
        header: 'Conversion Ratio',
        cell: ({ row }) => {
          const ratio = row.original.conversionRatio;
          if (!row.original.baseUnitId || ratio === undefined || ratio === null) return '1.00';
          return <span className="font-mono">{Number(ratio).toFixed(4)}</span>;
        },
      },
      {
        id: 'productCount',
        header: 'Product Count',
        cell: ({ row }) => (
          <Badge variant="outline">{row.original._count?.products ?? 0} products</Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={status === 'ACTIVE' ? 'success' : 'secondary'} className="capitalize">
              {status.toLowerCase()}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => router.push(`/products/units/${row.original.id}`)}
              title="View details"
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => router.push(`/products/units/${row.original.id}/edit`)}
              title="Edit"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                archiveUnit(row.original.id, {
                  onSuccess: () => {
                    toast.success('Unit archived successfully');
                    void refetch();
                  },
                });
              }}
              title="Archive"
              className="text-destructive hover:bg-destructive/10"
            >
              <Archive className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [units],
  );

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Units of Measurement"
          description="Manage base and derived inventory tracking units (e.g. pcs, box, kgs, ml)."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild leftIcon={<History className="w-4 h-4" />}>
            <Link href="/products/units/archived">View Archive</Link>
          </Button>
          <Button size="sm" asChild leftIcon={<Plus className="w-4 h-4" />}>
            <Link href="/products/units/new">Add Unit</Link>
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border border-border bg-card p-4 rounded-xl shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search unit name, symbol, description..."
              className="pl-9 h-9"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-[--radius-md] border border-input bg-background px-3 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-9"
          >
            <option value="ACTIVE">Active Status</option>
            <option value="INACTIVE">Inactive Status</option>
            <option value="">All Statuses</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            loading={isFetching}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            className="h-9"
          >
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-border">
          {/* Density Toggle */}
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
            <Button
              variant={density === 'comfortable' ? 'secondary' : 'ghost'}
              size="xs"
              onClick={() => setDensity('comfortable')}
              className="px-2"
            >
              Comfy
            </Button>
            <Button
              variant={density === 'compact' ? 'secondary' : 'ghost'}
              size="xs"
              onClick={() => setDensity('compact')}
              className="px-2"
            >
              Compact
            </Button>
          </div>

          {/* Export UI Button */}
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <FileDown className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Selected Rows Bulk Toolbar */}
      {selectedRows.length > 0 && (
        <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between text-xs animate-[fadeIn_0.15s_ease-out]">
          <span className="font-medium text-foreground">{selectedRows.length} units selected</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="xs"
              leftIcon={<Archive className="w-3.5 h-3.5" />}
              onClick={handleBulkArchive}
              className="bg-background"
            >
              Archive Selected
            </Button>
            <Button
              variant="destructive"
              size="xs"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={units}
          loading={isLoading}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          enableRowSelection
          onRowSelectionChange={setSelectedRows}
          emptyTitle="No Units Found"
          emptyDescription="Configure units of measurement to track inventory weight, size, and packaging ratios."
          className={density === 'compact' ? 'table-compact' : undefined}
        />
      </div>
    </PageContainer>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  RefreshCw,
  Archive,
  Trash2,
  Search,
  SlidersHorizontal,
  X,
  Warehouse as WarehouseIcon,
  ShieldAlert,
  Building,
  User,
  Activity,
  FileDown,
} from 'lucide-react';
import { useWarehouses, useDeleteWarehouse, useUpdateWarehouse } from '@/hooks/use-warehouse';
import { useBranches } from '@/hooks/use-branch';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import type { Warehouse, WarehouseStatus, StorageType } from '@/types/warehouse';
import { toast } from 'sonner';

const STORAGE_TYPES: { value: StorageType | ''; label: string }[] = [
  { value: '', label: 'All Storage Types' },
  { value: 'DRY', label: 'Dry Storage' },
  { value: 'COLD', label: 'Cold Storage' },
  { value: 'HAZARDOUS', label: 'Hazardous' },
  { value: 'CLIMATE_CONTROLLED', label: 'Climate Controlled' },
];

export default function WarehousesPage() {
  const router = useRouter();

  // Filters State
  const [q, setQ] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<WarehouseStatus | ''>('');
  const [branchFilter, setBranchFilter] = React.useState('');
  const [storageTypeFilter, setStorageTypeFilter] = React.useState<StorageType | ''>('');
  const [sortBy, setSortBy] = React.useState('createdAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Queries
  const { data: branchesResponse } = useBranches();
  const branches = branchesResponse?.data || [];

  const {
    data: warehousesResponse,
    isLoading,
    refetch,
    isFetching,
  } = useWarehouses({
    q: q || undefined,
    status: statusFilter || undefined,
    branchId: branchFilter || undefined,
    storageType: storageTypeFilter || undefined,
    sortBy,
    sortOrder,
  });

  const warehouses = warehousesResponse?.data || [];
  const activeWarehouses = warehouses.filter((w) => w.status === 'ACTIVE');

  // Capacity calculations for KPI dashboard
  const totalCapacity = warehouses.reduce((acc, curr) => acc + (curr.metadata?.capacity ?? 0), 0);
  const averageUtilization =
    warehouses.length > 0
      ? Math.round(
          warehouses.reduce((acc, curr) => acc + (curr.metadata?.utilization ?? 0), 0) /
            warehouses.length,
        )
      : 0;

  const deleteMutation = useDeleteWarehouse();
  const updateMutation = useUpdateWarehouse();

  // Bulk Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(warehouses.map((w) => w.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkStatusChange = async (status: WarehouseStatus) => {
    try {
      await Promise.all(
        selectedIds.map((id) => updateMutation.mutateAsync({ id, payload: { status } })),
      );
      setSelectedIds([]);
      void refetch();
      toast.success('Selected warehouses status updated');
    } catch {}
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Archive ${selectedIds.length} selected warehouses?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id)));
      setSelectedIds([]);
      void refetch();
    } catch {}
  };

  const handleExport = () => {
    toast.info('Exporting warehouse catalog records (UI Foundation)...');
  };

  const handleResetFilters = () => {
    setQ('');
    setStatusFilter('');
    setBranchFilter('');
    setStorageTypeFilter('');
  };

  return (
    <PageContainer>
      <PageHeader
        title="Warehouse Directory"
        description="Oversee storage capacity, monitor cold chain fills, and manage storage bins."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <FileDown className="w-4 h-4" />
              Export
            </Button>
            <Link href="/warehouses/archive">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Archive className="w-4 h-4" />
                Archived Depots
              </Button>
            </Link>
            <Link href="/warehouses/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Create Warehouse
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Dashboard Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        {/* KPI: Total warehouses */}
        <div className="rounded-2xl border border-border bg-cardard p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Facilities
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <WarehouseIcon className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-mono">
              {warehouses.length}
            </span>
            <span className="text-[10px] text-muted-foreground">registered depots</span>
          </div>
        </div>

        {/* KPI: Active warehouses */}
        <div className="rounded-2xl border border-border bg-cardard p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Depots
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
              Online
            </span>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-mono">
              {activeWarehouses.length}
            </span>
            <span className="text-[10px] text-muted-foreground">currently active</span>
          </div>
        </div>

        {/* KPI: Total Capacity */}
        <div className="rounded-2xl border border-border bg-cardard p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Global Capacity
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-mono">
              {totalCapacity.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground">m³ total space</span>
          </div>
        </div>

        {/* KPI: Fill level utilization */}
        <div className="rounded-2xl border border-border bg-cardard p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Utilization
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border uppercase tracking-wider',
                averageUtilization >= 80
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  : 'bg-primary/10 text-primary border-primary/20',
              )}
            >
              Fill Rate
            </span>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-mono">
              {averageUtilization}%
            </span>
            <span className="text-[10px] text-muted-foreground">average warehouse load</span>
          </div>
        </div>
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col gap-4 bg-cardard rounded-2xl border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by code, name, manager..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-xl bg-background text-sm focus-visible:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'gap-1.5',
                showFilters && 'bg-primary/5 text-primary border-primary/20',
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void refetch();
              }}
              className="p-2"
              title="Refresh"
            >
              <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/50">
            {/* Status */}
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                Depot Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as WarehouseStatus)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs focus:ring-primary focus:border-primary"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                Branch Location
              </label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs focus:ring-primary focus:border-primary"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Storage Type */}
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                Storage Environment
              </label>
              <select
                value={storageTypeFilter}
                onChange={(e) => setStorageTypeFilter(e.target.value as StorageType)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs focus:ring-primary focus:border-primary"
              >
                {STORAGE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <Button
                variant="ghost"
                size="xs"
                onClick={handleResetFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3 mr-1" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk status actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-2xl p-4 animate-in fade-in duration-200">
          <span className="text-xs font-semibold text-primary">
            {selectedIds.length} warehouses selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleBulkStatusChange('ACTIVE')}
              className="text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20"
            >
              Activate
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleBulkStatusChange('INACTIVE')}
              className="text-amber-500 hover:bg-amber-500/10 border-amber-500/20"
            >
              Deactivate
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={handleBulkDelete}
              className="text-rose-500 hover:bg-rose-500/10 border-rose-500/20"
            >
              Archive
            </Button>
          </div>
        </div>
      )}

      {/* Table grid */}
      <div className="border border-border bg-cardard rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={warehouses.length > 0 && selectedIds.length === warehouses.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Depot Code & Name</th>
                <th className="px-4 py-3">Branch Office</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Utilization Rate</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-xs text-muted-foreground animate-pulse"
                  >
                    Loading warehouses directory...
                  </td>
                </tr>
              ) : warehouses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-xs text-muted-foreground">
                    No warehouses registered.
                  </td>
                </tr>
              ) : (
                warehouses.map((wh) => {
                  const isSelected = selectedIds.includes(wh.id);
                  const cap = wh.metadata?.capacity ?? 5000;
                  const util = wh.metadata?.utilization ?? 0;

                  return (
                    <tr
                      key={wh.id}
                      onClick={() => router.push(`/warehouses/${wh.id}`)}
                      className={cn(
                        'group border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/40',
                        isSelected && 'bg-primary/5',
                      )}
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(wh.id, e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                        />
                      </td>

                      {/* Code & Name */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                          {wh.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase">
                          {wh.code}{' '}
                          {wh.isDefault && (
                            <span className="text-indigo-500 font-bold ml-1 tracking-widest">
                              (Default)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Branch linked */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                          <span>{wh.branch?.name || 'Main Office'}</span>
                        </div>
                      </td>

                      {/* Manager */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                          <span>{wh.managerName || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Utilization */}
                      <td className="px-4 py-3.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'font-mono font-bold',
                              util >= 90
                                ? 'text-rose-500'
                                : util >= 70
                                  ? 'text-amber-500'
                                  : 'text-emerald-500',
                            )}
                          >
                            {util}%
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            ({Math.round((cap * util) / 100).toLocaleString()} /{' '}
                            {cap.toLocaleString()} m³)
                          </span>
                        </div>
                      </td>

                      {/* Storage Environment */}
                      <td className="px-4 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase">
                        {wh.metadata?.storageType || 'DRY'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
                            wh.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-muted text-muted-foreground border-border',
                          )}
                        >
                          {wh.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/warehouses/${wh.id}/edit`}>
                            <Button variant="ghost" size="xs">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              if (confirm('Archive this warehouse facility?')) {
                                deleteMutation.mutate(wh.id, {
                                  onSuccess: () => void refetch(),
                                });
                              }
                            }}
                            className="text-rose-500 hover:bg-rose-500/10"
                          >
                            Archive
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

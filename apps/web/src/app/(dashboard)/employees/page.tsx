'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  RefreshCw,
  Archive,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  SlidersHorizontal,
  X,
  UserCheck,
  Building,
  Briefcase,
} from 'lucide-react';
import { useEmployees, useDeleteEmployee, useUpdateEmployee } from '@/hooks/use-employee';
import { useDepartments, useDesignations } from '@/hooks/use-department-designation';
import { useBranches } from '@/hooks/use-branch';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import type { Employee, EmployeeStatus } from '@/types/employee';

const PAGE_SIZES = [10, 25, 50, 100];

const STATUS_OPTIONS: { value: EmployeeStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'TERMINATED', label: 'Terminated' },
];

function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-border/50">
          <div className="w-4 h-4 rounded bg-muted flex-shrink-0" />
          <div className="w-9 h-9 rounded-xl bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-36 bg-muted rounded" />
            <div className="h-2.5 w-24 bg-muted rounded" />
          </div>
          <div className="h-3 w-28 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-5 w-20 bg-muted rounded-full" />
          <div className="w-8 h-8 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export default function EmployeesPage() {
  const router = useRouter();

  // Filters State
  const [searchTerm, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<EmployeeStatus | ''>('');
  const [branchFilter, setBranchFilter] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('');
  const [desigFilter, setDesigFilter] = React.useState('');
  const [sortBy, setSortBy] = React.useState('createdAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(25);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Queries
  const { data: branches } = useBranches();
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();

  const { data, isLoading, refetch, isFetching } = useEmployees({
    page,
    limit,
    q: searchTerm || undefined,
    status: statusFilter || undefined,
    branchId: branchFilter || undefined,
    departmentId: deptFilter || undefined,
    designationId: desigFilter || undefined,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeleteEmployee();
  const updateMutation = useUpdateEmployee();

  const employees = data?.data || [];
  const meta = data?.meta;

  const totalEmployees = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(employees.map((emp) => emp.id));
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

  // Bulk Actions
  const handleBulkStatusChange = async (status: EmployeeStatus) => {
    try {
      await Promise.all(
        selectedIds.map((id) => updateMutation.mutateAsync({ id, payload: { status } })),
      );
      setSelectedIds([]);
      void refetch();
    } catch {}
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(`Are you sure you want to archive ${selectedIds.length} selected employees?`)
    )
      return;
    try {
      await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id)));
      setSelectedIds([]);
      void refetch();
    } catch {}
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setBranchFilter('');
    setDeptFilter('');
    setDesigFilter('');
    setPage(1);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Employee Directory"
        description="Administer corporate staffing, assign branches, departments, and payroll credentials."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/employees/archive">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Archive className="w-4 h-4" />
                Archived Staff
              </Button>
            </Link>
            <Link href="/employees/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Onboard Employee
              </Button>
            </Link>
          </div>
        }
      />

      {/* Toolbar controls */}
      <div className="flex flex-col gap-4 bg-card rounded-2xl border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-xl bg-background text-sm focus-visible:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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

        {/* Dynamic Filters Row */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border/50">
            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                Employment Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as EmployeeStatus);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs focus:ring-primary focus:border-primary"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                Branch Location
              </label>
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs focus:ring-primary focus:border-primary"
              >
                <option value="">All Branches</option>
                {branches?.data?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                Department
              </label>
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs focus:ring-primary focus:border-primary"
              >
                <option value="">All Departments</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                Designation
              </label>
              <select
                value={desigFilter}
                onChange={(e) => {
                  setDesigFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs focus:ring-primary focus:border-primary"
              >
                <option value="">All Designations</option>
                {designations?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters Option */}
            <div className="sm:col-span-2 md:col-span-4 flex justify-end">
              <Button
                variant="ghost"
                size="xs"
                onClick={handleResetFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3 mr-1" />
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk actions status panel */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-2xl p-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="text-xs font-semibold text-primary">
            {selectedIds.length} employees selected
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

      {/* Employees Grid/Table Panel */}
      <div className="border border-border bg-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={employees.length > 0 && selectedIds.length === employees.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Photo & Name</th>
                <th className="px-4 py-3">Phone & Email</th>
                <th className="px-4 py-3">Dept & Designation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Hire Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <TableSkeleton />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    No employees found matching search criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const isSelected = selectedIds.includes(emp.id);
                  const isTerminated = emp.status === 'TERMINATED';

                  // Get department/designation names
                  const dept =
                    departments?.find((d) => d.id === emp.metadata?.departmentId)?.name ||
                    'General';
                  const desig =
                    designations?.find((d) => d.id === emp.metadata?.designationId)?.name ||
                    'Staff';

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => router.push(`/employees/${emp.id}`)}
                      className={cn(
                        'group border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/40',
                        isSelected && 'bg-primary/5',
                        isTerminated && 'opacity-65',
                      )}
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(emp.id, e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>

                      {/* Photo & Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary text-xs">
                            {emp.metadata?.photoUrl ? (
                              <img
                                src={emp.metadata.photoUrl}
                                alt={emp.fullName}
                                className="h-full w-full rounded-xl object-cover"
                              />
                            ) : (
                              `${emp.firstName[0] ?? ''}${emp.lastName[0] ?? ''}`.toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                              ID: {emp.id.slice(0, 8).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <div>{emp.phone || 'No phone'}</div>
                        <div className="mt-0.5 text-[10px]">{emp.email || 'No email'}</div>
                      </td>

                      {/* Dept & Designation */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-muted-foreground/60" />
                          <span>{dept}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3.5 h-3.5 text-muted-foreground/60" />
                          <span className="text-[10px]">{desig}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
                            emp.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : emp.status === 'INACTIVE'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                          )}
                        >
                          {emp.status}
                        </span>
                      </td>

                      {/* Joining date */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/employees/${emp.id}/edit`}>
                            <Button variant="ghost" size="xs">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              if (confirm('Archive this employee?')) {
                                deleteMutation.mutate(emp.id);
                              }
                            }}
                            className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
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

        {/* Pagination controls */}
        {meta && (
          <div className="flex items-center justify-between border-t border-border/80 px-4 py-3.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Total: {totalEmployees} employees</span>
              <div className="flex items-center gap-1.5">
                <span>Page Size:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded border border-border bg-background p-1 text-[11px]"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="xs"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

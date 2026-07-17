'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  Building,
  User as UserIcon,
  Trash2,
  AlertCircle,
  Warehouse,
  Users,
} from 'lucide-react';
import { useBranch, useDeleteBranch } from '@/hooks/use-branch';
import { useWarehouses } from '@/hooks/use-warehouse';
import { useEmployees } from '@/hooks/use-employee';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { WarehouseCard } from '@/components/warehouse/warehouse-card';
import { EmployeeCard } from '@/components/employee/employee-card';
import { cn } from '@/utils/cn';

export default function BranchDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Queries
  const { data: branch, isLoading: isLoadingBranch } = useBranch(id);
  const { data: warehousesResponse } = useWarehouses({ branchId: id });
  const { data: employeesResponse } = useEmployees({ branchId: id });

  const deleteMutation = useDeleteBranch();
  const [activeTab, setActiveTab] = React.useState<'warehouses' | 'staff'>('warehouses');

  const warehouses = warehousesResponse?.data || [];
  const employees = employeesResponse?.data || [];

  if (isLoadingBranch) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading branch profiles...
        </div>
      </PageContainer>
    );
  }

  if (!branch) {
    return (
      <PageContainer>
        <div className="text-center py-20 bg-cardard rounded-2xl border border-border">
          <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground" />
          <h2 className="font-semibold text-foreground text-sm mt-3">Branch Location Not Found</h2>
          <Link href="/branches" className="mt-4 inline-block">
            <Button size="sm">Back to Directory</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to archive this branch location?')) return;
    deleteMutation.mutate(branch.id, {
      onSuccess: () => {
        router.push('/branches');
      },
    });
  };

  const city = branch.metadata?.city || 'General';
  const country = branch.metadata?.country || 'USA';
  const opening = branch.metadata?.openingDate;

  return (
    <PageContainer>
      <PageHeader
        title={branch.name}
        description={`Branch Office Ledger Details & Corporate Staff allocations.`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/branches">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                Branch Directory
              </Button>
            </Link>
            <Link href={`/branches/${branch.id}/edit`}>
              <Button size="sm" className="gap-1.5">
                <Edit className="w-4 h-4" />
                Edit Details
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-rose-500 hover:bg-rose-500/10 border-rose-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Archive
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Left summary card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-cardard p-6 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building className="w-8 h-8" />
            </div>

            <h2 className="mt-4 font-bold text-foreground text-lg leading-none">{branch.name}</h2>
            <span className="block text-[10px] font-mono text-muted-foreground mt-1.5 uppercase">
              ID: {branch.id.slice(0, 8).toUpperCase()}
            </span>

            <span
              className={cn(
                'mt-3.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                branch.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-muted text-muted-foreground border-border',
              )}
            >
              {branch.status}
            </span>

            {/* Quick Stats */}
            <div className="w-full mt-6 grid grid-cols-2 gap-3 pt-6 border-t border-border/60 text-xs">
              <div className="bg-muted/40 p-2.5 rounded-xl text-center">
                <span className="block text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Associated Warehouses
                </span>
                <span className="block mt-1 font-bold text-foreground text-sm font-mono">
                  {warehouses.length}
                </span>
              </div>
              <div className="bg-muted/40 p-2.5 rounded-xl text-center">
                <span className="block text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Assigned Staff
                </span>
                <span className="block mt-1 font-bold text-foreground text-sm font-mono">
                  {employees.length}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="w-full mt-6 space-y-3 pt-6 border-t border-border/60 text-left text-xs text-muted-foreground">
              {branch.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{branch.phone}</span>
                </div>
              )}
              {branch.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0 truncate" />
                  <span className="truncate">{branch.email}</span>
                </div>
              )}
              {branch.address && (
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {branch.address}, {city}
                  </span>
                </div>
              )}
              {opening && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Opened: {new Date(opening).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side tabbed grids */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-border bg-cardard rounded-2xl p-1.5 gap-1 shadow-sm">
            <button
              onClick={() => setActiveTab('warehouses')}
              className={cn(
                'flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5',
                activeTab === 'warehouses'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              <Warehouse className="w-3.5 h-3.5" />
              Depots ({warehouses.length})
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={cn(
                'flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5',
                activeTab === 'staff'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              <Users className="w-3.5 h-3.5" />
              Assigned Staff ({employees.length})
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-cardard p-6 min-h-[350px]">
            {/* Warehouses list */}
            {activeTab === 'warehouses' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-sm border-b border-border/60 pb-3">
                  Branch Warehouses
                </h3>

                {warehouses.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                    No warehouses linked to this branch yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {warehouses.map((wh) => (
                      <WarehouseCard key={wh.id} warehouse={wh} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Staff list */}
            {activeTab === 'staff' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-sm border-b border-border/60 pb-3">
                  Assigned Employees
                </h3>

                {employees.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                    No employees assigned to this branch yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {employees.map((emp) => (
                      <EmployeeCard key={emp.id} employee={emp} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

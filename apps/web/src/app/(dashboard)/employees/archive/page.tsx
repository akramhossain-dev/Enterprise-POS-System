'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, RefreshCw, Undo, Search } from 'lucide-react';
import { useEmployees, useUpdateEmployee } from '@/hooks/use-employee';
import { useDepartments, useDesignations } from '@/hooks/use-department-designation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export default function ArchivedEmployeesPage() {
  const router = useRouter();
  const [searchTerm, setSearchQuery] = React.useState('');

  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();

  // Terminated employees acts as Archived
  const { data, isLoading, refetch, isFetching } = useEmployees({
    status: 'TERMINATED',
    q: searchTerm || undefined,
  });

  const restoreMutation = useUpdateEmployee();
  const employees = data?.data || [];

  const handleRestore = async (id: string) => {
    if (!window.confirm('Are you sure you want to restore this employee?')) return;
    try {
      await restoreMutation.mutateAsync({
        id,
        payload: { status: 'ACTIVE' },
      });
      void refetch();
    } catch {}
  };

  return (
    <PageContainer>
      <PageHeader
        title="Archived Staff"
        description="View terminated or soft-deleted employee profiles and restore their employment records."
        actions={
          <Link href="/employees">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ChevronLeft className="w-4 h-4" />
              Back to Directory
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-4 bg-cardard rounded-2xl border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search archived by name..."
              value={searchTerm}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-xl bg-background text-sm focus-visible:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refetch();
            }}
            className="p-2"
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      <div className="border border-border bg-cardard rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Photo & Name</th>
                <th className="px-4 py-3">Phone & Email</th>
                <th className="px-4 py-3">Dept & Designation</th>
                <th className="px-4 py-3">Date Terminated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-xs text-muted-foreground">
                    Loading archived list...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-xs text-muted-foreground">
                    No archived employees found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const dept =
                    departments?.find((d) => d.id === emp.metadata?.departmentId)?.name ||
                    'General';
                  const desig =
                    designations?.find((d) => d.id === emp.metadata?.designationId)?.name ||
                    'Staff';

                  return (
                    <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/35">
                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted font-semibold text-muted-foreground text-xs">
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
                            <div className="font-semibold text-foreground text-sm">
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
                        <div>{emp.phone || 'N/A'}</div>
                        <div className="mt-0.5 text-[10px]">{emp.email || 'N/A'}</div>
                      </td>

                      {/* Dept & Designation */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <div>{dept}</div>
                        <div className="text-[10px] mt-0.5">{desig}</div>
                      </td>

                      {/* Date Terminated */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {emp.deletedAt ? new Date(emp.deletedAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Action Restore */}
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleRestore(emp.id)}
                          className="text-primary hover:bg-primary/10 border-primary/20 gap-1"
                        >
                          <Undo className="w-3.5 h-3.5" />
                          Restore
                        </Button>
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

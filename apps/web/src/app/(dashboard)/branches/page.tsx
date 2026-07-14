'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  RefreshCw,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Archive,
  Store,
} from 'lucide-react';
import { useBranches, useDeleteBranch } from '@/hooks/use-branch';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import type { Branch, BranchStatus } from '@/types/warehouse';

export default function BranchesPage() {
  const router = useRouter();
  const [q, setQ] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<BranchStatus | ''>('');

  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = useBranches({
    q: q || undefined,
    status: statusFilter || undefined,
  });

  const deleteMutation = useDeleteBranch();
  const branches = response?.data || [];

  return (
    <PageContainer>
      <PageHeader
        title="Branch Locations"
        description="Administer multi-branch outlets, link local warehouses, and allocate local managers."
        actions={
          <Link href="/branches/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add Branch Office
            </Button>
          </Link>
        }
      />

      {/* Toolbar filters */}
      <div className="flex flex-col md:flex-row gap-3 bg-card border border-border rounded-2xl p-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search branches by name, city..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl bg-background text-sm focus-visible:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Status */}
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BranchStatus)}
            className="w-full rounded-xl border border-border bg-background p-2 text-xs focus:ring-primary focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
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

      {/* List Table */}
      <div className="border border-border bg-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Branch Details</th>
                <th className="px-4 py-3">Code / ID</th>
                <th className="px-4 py-3">Phone & Email</th>
                <th className="px-4 py-3">Physical Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-xs text-muted-foreground animate-pulse"
                  >
                    Loading branch directories...
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                    No branches registered.
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => router.push(`/branches/${b.id}`)}
                    className="group border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                        <Store className="w-4 h-4 text-muted-foreground" />
                        {b.name}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground">
                      {b.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      <div>{b.phone || 'N/A'}</div>
                      <div className="text-[10px] mt-0.5">{b.email || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {b.address || 'N/A'} {b.metadata?.city && `, ${b.metadata.city}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
                          b.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border',
                        )}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/branches/${b.id}/edit`}>
                          <Button variant="ghost" size="xs">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            if (confirm('Archive this branch office?')) {
                              deleteMutation.mutate(b.id, {
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

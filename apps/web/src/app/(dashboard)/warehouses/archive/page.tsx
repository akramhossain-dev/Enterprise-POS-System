'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, RefreshCw, Undo, Search } from 'lucide-react';
import { useWarehouses, useUpdateWarehouse } from '@/hooks/use-warehouse';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export default function ArchivedWarehousesPage() {
  const router = useRouter();
  const [q, setQ] = React.useState('');

  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = useWarehouses({
    status: 'INACTIVE',
    q: q || undefined,
  });

  const restoreMutation = useUpdateWarehouse();
  const warehouses = response?.data || [];

  const handleRestore = async (id: string) => {
    if (!window.confirm('Restore this warehouse facility back online?')) return;
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
        title="Archived Depots"
        description="View decommissioned, inactive, or archived warehouse storage facilities and restore them."
        actions={
          <Link href="/warehouses">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ChevronLeft className="w-4 h-4" />
              Depot Directory
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-4 bg-card rounded-2xl border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search archived depots..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-xl bg-background text-sm focus-visible:outline-none focus:ring-2 focus:ring-primary"
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

      <div className="border border-border bg-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Code & Name</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-xs text-muted-foreground animate-pulse"
                  >
                    Loading archived facilities...
                  </td>
                </tr>
              ) : warehouses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-xs text-muted-foreground">
                    No archived warehouses.
                  </td>
                </tr>
              ) : (
                warehouses.map((wh) => (
                  <tr key={wh.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-foreground text-sm">{wh.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {wh.code}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {wh.managerName || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {wh.city}, {wh.country}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                        {wh.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleRestore(wh.id)}
                        className="text-primary hover:bg-primary/10 border-primary/20 gap-1"
                      >
                        <Undo className="w-3.5 h-3.5" />
                        Restore
                      </Button>
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

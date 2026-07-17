'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Shield, RefreshCw, KeyRound, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { useAdminRoles, useCreateRole, useDeleteRole } from '@/hooks/use-admin-role';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export default function RolesManagementPage() {
  const { data: roles, isLoading, refetch, isFetching } = useAdminRoles();
  const deleteMutation = useDeleteRole();

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the security role "${name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  return (
    <PageContainer>
      <PageHeader
        title="Roles & Security Matrix"
        description="Design system authorization privileges, assign module credentials, and override staff permission levels."
        actions={
          <Link href="/roles/new">
            <Button className="gap-1.5" size="sm">
              <Plus className="w-4 h-4" />
              Create Custom Role
            </Button>
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-cardard border border-border rounded-2xl p-4">
        <span className="text-xs text-muted-foreground font-semibold">
          {roles?.length ?? 0} security roles configured
        </span>
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

      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground animate-pulse">
          Loading security roles matrix database...
        </div>
      ) : !roles || roles.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border bg-cardard rounded-2xl text-xs text-muted-foreground">
          No security roles found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {roles.map((role) => (
            <div
              key={role.id}
              className="group rounded-2xl border border-border bg-cardard p-5 flex flex-col justify-between transition-all hover:border-primary/20 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm uppercase">
                        {role.name}
                      </h3>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        {role.permissions.length} Permissions Authorized
                      </span>
                    </div>
                  </div>

                  {/* System role tag */}
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border',
                      role.isSystem
                        ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                    )}
                  >
                    {role.isSystem ? 'System' : 'Custom'}
                  </span>
                </div>

                <p className="mt-4 text-xs text-muted-foreground leading-relaxed line-clamp-3 min-h-[3rem]">
                  {role.description || 'No description configured for this role.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                <Link
                  href={`/roles/${role.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  View Matrix &rarr;
                </Link>

                {!role.isSystem && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleDelete(role.id, role.name)}
                    className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 p-1"
                    title="Delete Role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

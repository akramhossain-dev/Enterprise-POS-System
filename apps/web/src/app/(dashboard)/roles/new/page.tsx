'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Loader2, Shield } from 'lucide-react';
import { usePermissions, useCreateRole } from '@/hooks/use-admin-role';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PermissionMatrix } from '@/components/user/permission-matrix';
import { toast } from 'sonner';

export default function NewRolePage() {
  const router = useRouter();
  const { data: permissionGroups, isLoading: isLoadingPerms } = usePermissions();
  const createMutation = useCreateRole();

  const [roleName, setRoleName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) {
      toast.error('Role name is required');
      return;
    }
    if (selectedPermissions.length === 0) {
      toast.error('Please authorize at least one module permission');
      return;
    }

    createMutation.mutate(
      {
        name: roleName,
        description,
        permissions: selectedPermissions,
      },
      {
        onSuccess: () => {
          router.push('/roles');
        },
      },
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Create Custom Security Role"
        description="Design a new staffing authorization tier and grant explicit granular access scopes."
        actions={
          <Link href="/roles">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ChevronLeft className="w-4 h-4" />
              Cancel
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleCreate} className="space-y-6 max-w-5xl text-left">
        {/* Core fields */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-base">Role Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Role Name *"
              placeholder="e.g. FLOOR_SUPERVISOR"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
            />
            <Input
              label="Description"
              placeholder="e.g. Retail supervisor managing store floor staff"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Permission matrix selection */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground text-base border-b border-border/50 pb-3">
            Authorization Privileges Matrix
          </h2>

          {isLoadingPerms ? (
            <div className="text-xs text-muted-foreground animate-pulse py-8 text-center">
              Loading available permission scopes...
            </div>
          ) : (
            <PermissionMatrix
              groups={permissionGroups || []}
              selectedPermissions={selectedPermissions}
              onChange={setSelectedPermissions}
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link href="/roles">
            <Button variant="outline" type="button">
              Discard
            </Button>
          </Link>
          <Button type="submit" disabled={createMutation.isPending} className="gap-1.5">
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Security Role
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

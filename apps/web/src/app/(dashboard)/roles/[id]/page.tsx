'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Save, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { usePermissions, useAdminRole, useUpdateRole } from '@/hooks/use-admin-role';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PermissionMatrix } from '@/components/user/permission-matrix';
import { toast } from 'sonner';

export default function RoleDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Queries
  const { data: role, isLoading: isLoadingRole, refetch } = useAdminRole(id);
  const { data: permissionGroups, isLoading: isLoadingPerms } = usePermissions();

  const updateMutation = useUpdateRole();

  const [roleName, setRoleName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);

  // Update local states when role data is resolved
  React.useEffect(() => {
    if (role) {
      setRoleName(role.name);
      setDescription(role.description || '');
      setSelectedPermissions(role.permissions.map((p) => p.name));
    }
  }, [role]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role?.isSystem) {
      toast.error('System roles are write-protected and cannot be edited.');
      return;
    }
    if (!roleName) {
      toast.error('Role name is required');
      return;
    }
    if (selectedPermissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    updateMutation.mutate(
      {
        id,
        payload: {
          name: roleName,
          description,
          permissions: selectedPermissions,
        },
      },
      {
        onSuccess: () => {
          void refetch();
        },
      },
    );
  };

  if (isLoadingRole) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading role permission matrix...
        </div>
      </PageContainer>
    );
  }

  if (!role) {
    return (
      <PageContainer>
        <div className="text-center py-20 border border-dashed border-border bg-card rounded-2xl">
          <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto" />
          <h2 className="font-semibold text-foreground text-sm mt-3">Security Role Not Found</h2>
          <Link href="/roles" className="mt-4 inline-block">
            <Button size="sm">Back to Roles Directory</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`${role.name} Matrix`}
        description={
          role.isSystem
            ? 'System pre-configured privileges. Read-only.'
            : 'Edit custom tier privilege authorization.'
        }
        actions={
          <Link href="/roles">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ChevronLeft className="w-4 h-4" />
              Roles Directory
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleUpdate} className="space-y-6 max-w-5xl text-left">
        {/* Core Info */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-base">Role Metadata</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Role Name *"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              disabled={role.isSystem}
              required
            />
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={role.isSystem}
            />
          </div>
        </div>

        {/* Matrix component */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground text-base border-b border-border/50 pb-3">
            Authorization Privileges Matrix
          </h2>

          {isLoadingPerms ? (
            <div className="text-xs text-muted-foreground py-8 text-center animate-pulse">
              Loading security modules...
            </div>
          ) : (
            <PermissionMatrix
              groups={permissionGroups || []}
              selectedPermissions={selectedPermissions}
              onChange={setSelectedPermissions}
              readOnly={role.isSystem}
            />
          )}
        </div>

        {/* Submit Actions */}
        {!role.isSystem && (
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link href="/roles">
              <Button variant="outline" type="button">
                Discard Changes
              </Button>
            </Link>
            <Button type="submit" disabled={updateMutation.isPending} className="gap-1.5">
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Matrix Changes
            </Button>
          </div>
        )}
      </form>
    </PageContainer>
  );
}

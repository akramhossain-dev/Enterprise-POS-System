'use client';

import * as React from 'react';
import {
  Plus,
  RefreshCw,
  KeyRound,
  Lock,
  ShieldAlert,
  Key,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
} from '@/hooks/use-admin-user';
import { useAdminRoles } from '@/hooks/use-admin-role';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { UserCard } from '@/components/user/user-card';
import { cn } from '@/utils/cn';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function UserManagementPage() {
  const [q, setQ] = React.useState('');
  const [roleId, setRoleId] = React.useState('');
  const [status, setStatus] = React.useState<'ACTIVE' | 'INACTIVE' | 'PENDING' | ''>('');

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newUserName, setNewUserName] = React.useState('');
  const [newUserEmail, setNewUserEmail] = React.useState('');
  const [newUserPhone, setNewUserPhone] = React.useState('');
  const [newUserRole, setNewUserRole] = React.useState('');
  const [newUserPassword, setNewUserPassword] = React.useState('');

  const {
    data: usersResponse,
    isLoading,
    refetch,
    isFetching,
  } = useAdminUsers({
    q: q || undefined,
    roleId: roleId || undefined,
    status: (status as any) || undefined,
  });

  const { data: roles } = useAdminRoles();
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser();
  const deleteMutation = useDeleteAdminUser();

  const users = usersResponse?.data || [];

  const handleLockToggle = async (userId: string, shouldLock: boolean) => {
    try {
      await updateMutation.mutateAsync({
        id: userId,
        payload: { status: shouldLock ? 'INACTIVE' : 'ACTIVE' },
      });
      void refetch();
    } catch {}
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      await updateMutation.mutateAsync({
        id: userId,
        payload: { status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
      });
      void refetch();
    } catch {}
  };

  const handleResetPassword = async (userId: string) => {
    const newPass = window.prompt(
      'Enter new temporary password for this user (Min 8 chars):',
      'TempPass@123!',
    );
    if (!newPass) return;
    if (newPass.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: userId,
        payload: { password: newPass } as any, // Add mock password update payload
      });
      toast.success('User password changed successfully');
    } catch {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserRole) {
      toast.error('Please fill in name, email and role');
      return;
    }

    createMutation.mutate(
      {
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone || undefined,
        roleId: newUserRole,
        password: newUserPassword || undefined,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setNewUserName('');
          setNewUserEmail('');
          setNewUserPhone('');
          setNewUserRole('');
          setNewUserPassword('');
          void refetch();
        },
      },
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="User Accounts"
        description="Monitor active operator accounts, configure security credentials, and assign roles."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5" size="sm">
            <Plus className="w-4 h-4" />
            Create User Account
          </Button>
        }
      />

      {/* Toolbar filters */}
      <div className="flex flex-col md:flex-row gap-3 bg-cardard border border-border rounded-2xl p-4">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-3 pr-4 py-2 border border-border rounded-xl bg-background text-xs focus-visible:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Role Selector */}
        <div className="w-full md:w-48">
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="w-full rounded-xl border border-border bg-background p-2 text-xs focus:ring-primary"
          >
            <option value="">All Security Roles</option>
            {roles?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status selector */}
        <div className="w-full md:w-48">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full rounded-xl border border-border bg-background p-2 text-xs focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
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

      {/* Users grid list */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-muted-foreground animate-pulse">
          Loading system user accounts directory...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border bg-cardard rounded-2xl text-xs text-muted-foreground">
          No system users found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onLockToggle={handleLockToggle}
              onStatusToggle={handleStatusToggle}
              onResetPassword={handleResetPassword}
            />
          ))}
        </div>
      )}

      {/* Dialog for creating user */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateUser} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Register User Account</DialogTitle>
              <DialogDescription>
                Onboard a new operator user account to access the POS dashboard.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5">
              <Input
                label="Full Name *"
                placeholder="e.g. Alice Smith"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="e.g. alice@enterprise-pos.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                placeholder="e.g. +1 555-0929"
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
              />

              {/* Role dropdown selection */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Security Role *
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Security Role...</option>
                  {roles?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Password (Optional - default is 'TemporaryPass123!')"
                type="password"
                placeholder="Set user password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="gap-1">
                {createMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  Key,
  Clock,
  AlertCircle,
  Monitor,
  Activity,
  History,
  Lock,
  Unlock,
  Building,
} from 'lucide-react';
import {
  useAdminUser,
  useUserSessions,
  useRevokeUserSession,
  useRevokeAllUserSessions,
  useLoginHistory,
  useAuditLogs,
  useUpdateAdminUser,
} from '@/hooks/use-admin-user';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SessionCard } from '@/components/user/session-card';
import { ActivityTimeline } from '@/components/user/activity-timeline';
import { cn } from '@/utils/cn';

export default function UserDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Queries
  const { data: user, isLoading, refetch } = useAdminUser(id);
  const {
    data: sessions,
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useUserSessions(id);
  const { data: loginHistoryData } = useLoginHistory({ userId: id });
  const { data: auditLogsData } = useAuditLogs({ userId: id });

  const revokeSessionMutation = useRevokeUserSession(id);
  const revokeAllSessionsMutation = useRevokeAllUserSessions(id);
  const updateMutation = useUpdateAdminUser();

  const [activeTab, setActiveTab] = React.useState<'sessions' | 'activity' | 'history'>('sessions');

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading user security credentials...
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground" />
          <h2 className="font-semibold text-foreground text-sm mt-3">User Account Not Found</h2>
          <Link href="/users" className="mt-4 inline-block">
            <Button size="sm">Back to User Directory</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const initials =
    user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  const isLocked = user.status === 'INACTIVE';

  const handleLockToggle = async () => {
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        payload: { status: isLocked ? 'ACTIVE' : 'INACTIVE' },
      });
      void refetch();
    } catch {}
  };

  const handleRevokeAll = async () => {
    if (!window.confirm('Are you sure you want to terminate all other active login sessions?'))
      return;
    try {
      await revokeAllSessionsMutation.mutateAsync();
      void refetchSessions();
    } catch {}
  };

  return (
    <PageContainer>
      <PageHeader
        title="Security & User Controls"
        description={`Audit login devices, monitor activity logs, and configure security permissions for ${user.name}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/users">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <Button
              variant={isLocked ? 'default' : 'outline'}
              size="sm"
              onClick={handleLockToggle}
              className={cn(
                'gap-1.5 font-semibold text-xs transition-colors',
                isLocked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'text-rose-500 hover:bg-rose-500/10 border-rose-500/20',
              )}
            >
              {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isLocked ? 'Unlock Account' : 'Lock Account'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Left Side Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center">
            {/* User Icon */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 font-semibold text-primary text-2xl border border-primary/5">
              {initials}
              <span
                className={cn(
                  'absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card',
                  user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500',
                )}
              />
            </div>

            <h2 className="mt-4 font-bold text-foreground text-lg leading-none">{user.name}</h2>
            <p className="text-xs text-muted-foreground mt-1.5 font-mono">
              Role: <span className="font-semibold text-primary">{user.role?.name || 'STAFF'}</span>
            </p>

            <span
              className={cn(
                'mt-3.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                user.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20',
              )}
            >
              {user.status}
            </span>

            {/* Quick stats grid */}
            <div className="w-full mt-6 grid grid-cols-1 gap-2 pt-6 border-t border-border/60 text-left text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.lastLoginAt && (
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                  <span>Last Login: {new Date(user.lastLoginAt).toLocaleString()}</span>
                </div>
              )}
              {user.employeeId && (
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                  <span className="truncate">Bound Employee Profile ID: {user.employeeId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Security Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-border bg-card rounded-2xl p-1.5 gap-1 shadow-sm">
            <button
              onClick={() => setActiveTab('sessions')}
              className={cn(
                'flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5',
                activeTab === 'sessions'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              <Monitor className="w-3.5 h-3.5" />
              Active Sessions
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={cn(
                'flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5',
                activeTab === 'activity'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              <Activity className="w-3.5 h-3.5" />
              Activity Logs
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                'flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5',
                activeTab === 'history'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              <History className="w-3.5 h-3.5" />
              Login History
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 min-h-[350px]">
            {/* Active Sessions Panel */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="font-semibold text-foreground text-sm md:text-base">
                    Active Devices
                  </h3>
                  {sessions && sessions.length > 1 && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleRevokeAll}
                      className="text-rose-500 hover:bg-rose-500/10 border-rose-500/20"
                    >
                      Terminate All Others
                    </Button>
                  )}
                </div>

                {isLoadingSessions ? (
                  <div className="text-xs text-muted-foreground animate-pulse">
                    Loading active sessions...
                  </div>
                ) : !sessions || sessions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No active sessions found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((sess) => (
                      <SessionCard
                        key={sess.id}
                        session={sess}
                        onTerminate={async (sessId) => {
                          await revokeSessionMutation.mutateAsync(sessId);
                          void refetchSessions();
                        }}
                        isTerminating={revokeSessionMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Activity Logs Timeline */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-foreground text-sm md:text-base border-b border-border/60 pb-3">
                  Account Audit Trail
                </h3>
                <ActivityTimeline logs={auditLogsData?.data || []} />
              </div>
            )}

            {/* Login History Table */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-foreground text-sm md:text-base border-b border-border/60 pb-3">
                  Connection Logs
                </h3>

                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/80 bg-muted/40 font-semibold text-muted-foreground">
                        <th className="px-4 py-2.5">Date & Time</th>
                        <th className="px-4 py-2.5">IP Address</th>
                        <th className="px-4 py-2.5">Browser/Device</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loginHistoryData || loginHistoryData.data.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-muted-foreground">
                            No connection logs recorded.
                          </td>
                        </tr>
                      ) : (
                        loginHistoryData.data.map((h) => (
                          <tr key={h.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {new Date(h.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 font-mono">{h.ipAddress || 'N/A'}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {h.browser} ({h.device})
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border',
                                  h.status === 'SUCCESS'
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                                )}
                              >
                                {h.status === 'SUCCESS' ? 'Success' : `Failed: ${h.failureReason}`}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

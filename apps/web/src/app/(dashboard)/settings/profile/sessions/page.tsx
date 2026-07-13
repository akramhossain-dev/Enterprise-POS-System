'use client';

import { AnimatePresence } from 'framer-motion';
import { Monitor, AlertTriangle } from 'lucide-react';
import { useSessions, useRevokeSession, useRevokeAllSessions } from '@/hooks/use-sessions';
import { SessionCard } from '@/components/profile/session-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function SessionsPage() {
  const { data: sessions, isLoading } = useSessions();
  const { mutate: revokeSession, isPending: revoking, variables: revokingId } = useRevokeSession();
  const { mutate: revokeAll, isPending: revokingAll } = useRevokeAllSessions();

  const otherSessions = sessions?.filter((s) => !s.isCurrent) ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" />
                Active Sessions
              </CardTitle>
              <CardDescription className="mt-1">
                Devices currently signed in to your account.
              </CardDescription>
            </div>
            {otherSessions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                loading={revokingAll}
                onClick={() => revokeAll()}
                className="text-destructive border-destructive/30 hover:border-destructive/60 hover:text-destructive shrink-0"
                leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
              >
                Revoke all others
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-[--radius-lg]" />
            ))
          ) : !sessions?.length ? (
            <EmptyState
              title="No active sessions"
              description="You don't have any active sessions."
            />
          ) : (
            <AnimatePresence>
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onRevoke={(id) => revokeSession(id)}
                  isRevoking={revoking && revokingId === session.id}
                />
              ))}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* Security tip */}
      <div className="rounded-[--radius-lg] bg-muted/40 border border-border/60 p-4">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Security tip:</span> If you see a session
          you don&apos;t recognize, revoke it immediately and change your password.
        </p>
      </div>
    </div>
  );
}

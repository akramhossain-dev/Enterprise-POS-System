'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileText,
  History,
  LayoutDashboard,
  RefreshCw,
  Clock,
  ArrowRight,
  User,
  MessageSquare,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/purchase/status-badge';
import { usePurchaseReturns } from '@/hooks/use-purchase-return';
import { cn } from '@/utils/cn';

interface AggregateAuditLog {
  id: string;
  returnId: string;
  returnNumber: string;
  actionBy: string;
  actionDate: string;
  status: string;
  notes: string;
}

export default function ReturnHistoryPage() {
  const {
    data: returnResponse,
    isLoading,
    refetch,
    isFetching,
  } = usePurchaseReturns({
    page: 1,
    limit: 100,
  });

  const returns = returnResponse?.data || [];

  // Compile aggregate log items chronologically
  const auditLogs = React.useMemo<AggregateAuditLog[]>(() => {
    const list: AggregateAuditLog[] = [];
    returns.forEach((r) => {
      if (r.approvalTimeline) {
        r.approvalTimeline.forEach((t) => {
          list.push({
            id: t.id,
            returnId: r.id,
            returnNumber: r.returnNumber,
            actionBy: t.actionBy,
            actionDate: t.actionDate,
            status: t.status,
            notes: t.notes || '',
          });
        });
      }
    });

    // Sort descending by date
    return list.sort((a, b) => new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime());
  }, [returns]);

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Returns History & Logs"
        description="Comprehensive audit trail documenting state transitions, manager authorization timestamps, and logs."
        actions={
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </Button>
        }
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-border gap-4 mb-6">
        <Link
          href="/purchase/returns"
          className="pb-2.5 px-1 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4 text-muted-foreground" /> Active Returns
        </Link>
        <Link
          href="/purchase/returns/dashboard"
          className="pb-2.5 px-1 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        >
          <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Return Dashboard
        </Link>
        <Link
          href="/purchase/returns/history"
          className="border-b-2 border-primary pb-2.5 px-1 font-semibold text-sm text-foreground flex items-center gap-1.5"
        >
          <History className="w-4 h-4 text-primary" /> Audit History
        </Link>
      </div>

      {/* Audit History Logs Card */}
      <Card className="shadow-sm border-border bg-card text-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <History className="w-4 h-4 text-primary" /> Workflow Audit Ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground italic">
                Loading history ledger...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground italic">
                No workflow logs registered yet.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-muted/10 transition-colors flex gap-4 text-xs"
                >
                  {/* Left Circle Icon */}
                  <div className="flex-shrink-0 self-start p-2 rounded-full bg-primary/10 border border-primary/20">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-baseline gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          href={`/purchase/returns/${log.returnId}`}
                          className="font-mono font-bold text-primary hover:underline"
                        >
                          {log.returnNumber}
                        </Link>
                        <ArrowRight className="w-3 h-3 text-muted-foreground/60" />
                        <span className="font-semibold text-foreground">Status set to</span>
                        <StatusBadge status={log.status} />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(log.actionDate).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>
                          Action by: <strong className="text-foreground">{log.actionBy}</strong>
                        </span>
                      </div>
                      {log.notes && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span className="italic">"{log.notes}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

'use client';

import React from 'react';
import { User, Key, Settings, ShieldAlert, Monitor, LogIn, LogOut, FileText } from 'lucide-react';
import type { AuditLog } from '@/types/admin-user';

interface ActivityTimelineProps {
  logs: AuditLog[];
  loading?: boolean;
}

export function ActivityTimeline({ logs, loading = false }: ActivityTimelineProps) {
  const getActionIcon = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN')) return { icon: LogIn, color: 'bg-emerald-500/10 text-emerald-500' };
    if (act.includes('LOGOUT')) return { icon: LogOut, color: 'bg-amber-500/10 text-amber-500' };
    if (act.includes('PASSWORD') || act.includes('RESET'))
      return { icon: Key, color: 'bg-indigo-500/10 text-indigo-500' };
    if (act.includes('ROLE') || act.includes('PERMISSION'))
      return { icon: ShieldAlert, color: 'bg-rose-500/10 text-rose-500' };
    if (act.includes('EMPLOYEE')) return { icon: User, color: 'bg-blue-500/10 text-blue-500' };
    return { icon: FileText, color: 'bg-muted text-muted-foreground' };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-muted-foreground">
        No recent activities logged for this account.
      </div>
    );
  }

  return (
    <div className="relative border-l border-border/80 pl-6 ml-3 space-y-6">
      {logs.map((log) => {
        const { icon: Icon, color: iconColor } = getActionIcon(log.action);
        const formattedTime = new Date(log.createdAt).toLocaleString();

        return (
          <div key={log.id} className="relative group text-left">
            {/* Dot Timeline Marker */}
            <span className="absolute -left-[35px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full ${iconColor}`}
              >
                <Icon className="w-3 h-3" />
              </span>
            </span>

            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {log.action.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-muted-foreground/60">{formattedTime}</span>
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                Resource: <span className="font-medium text-foreground">{log.resource}</span>
                {log.ipAddress && ` from IP ${log.ipAddress}`}
                {log.device && ` (${log.device})`}
              </p>

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="mt-1.5 p-2 rounded-lg bg-muted/30 text-[10px] font-mono text-muted-foreground/90 overflow-x-auto">
                  {JSON.stringify(log.metadata)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

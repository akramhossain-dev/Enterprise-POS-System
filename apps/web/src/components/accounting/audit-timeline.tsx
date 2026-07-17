'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { ShieldCheck, User, Clock, Terminal, AlertTriangle } from 'lucide-react';
import type { AccountingAuditLog } from '@/types/accounting';

interface AuditTimelineProps {
  logs: AccountingAuditLog[];
  loading?: boolean;
}

export function AuditTimeline({ logs, loading = false }: AuditTimelineProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'POST_JOURNAL':
      case 'APPROVE_VOUCHER':
        return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />;
      case 'CLOSE_PERIOD':
      case 'TOGGLE_PERIOD_STATUS':
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-455" />;
      default:
        return <Terminal className="h-3.5 w-3.5 text-indigo-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-cardard border border-border rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
        No compliance audit logs logged.
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l border-border space-y-6 text-left">
      {logs.map((log) => (
        <div key={log.id} className="relative space-y-1">
          {/* Vertical timeline node indicator */}
          <span className="absolute -left-[35px] top-0.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-muted border border-border">
            {getActionIcon(log.action)}
          </span>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground font-sans">
                {log.action.replace(/_/g, ' ')}
              </span>
              <span className="text-[9px] bg-accent px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-muted-foreground font-sans">
                {log.module}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </span>
              {log.ipAddress && <span>IP: {log.ipAddress}</span>}
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-sans pr-4 leading-relaxed">{log.description}</p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans pt-0.5">
            <User className="h-3 w-3" />
            <span>
              Actor: <span className="text-muted-foreground font-bold">{log.userName}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

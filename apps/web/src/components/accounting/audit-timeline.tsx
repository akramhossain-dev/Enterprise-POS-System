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
            className="h-16 bg-[#0c1220] border border-slate-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-slate-850 rounded-xl text-slate-500 text-xs">
        No compliance audit logs logged.
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l border-slate-850 space-y-6 text-left">
      {logs.map((log) => (
        <div key={log.id} className="relative space-y-1">
          {/* Vertical timeline node indicator */}
          <span className="absolute -left-[35px] top-0.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-slate-950 border border-slate-800">
            {getActionIcon(log.action)}
          </span>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200 font-sans">
                {log.action.replace(/_/g, ' ')}
              </span>
              <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-slate-500 font-sans">
                {log.module}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </span>
              {log.ipAddress && <span>IP: {log.ipAddress}</span>}
            </div>
          </div>

          <p className="text-xs text-slate-400 font-sans pr-4 leading-relaxed">{log.description}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-sans pt-0.5">
            <User className="h-3 w-3" />
            <span>
              Actor: <span className="text-slate-350 font-bold">{log.userName}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

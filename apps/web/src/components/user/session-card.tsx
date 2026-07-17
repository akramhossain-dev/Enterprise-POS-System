'use client';

import React from 'react';
import { Monitor, Smartphone, Globe, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { ActiveSession } from '@/types/auth';
import { cn } from '@/utils/cn';

interface SessionCardProps {
  session: ActiveSession;
  onTerminate: (sessionId: string) => void;
  isTerminating?: boolean;
}

export function SessionCard({ session, onTerminate, isTerminating = false }: SessionCardProps) {
  // Guess browser/OS icons
  const isMobile =
    session.device.toLowerCase().includes('phone') ||
    session.device.toLowerCase().includes('mobile') ||
    session.os.toLowerCase().includes('ios') ||
    session.os.toLowerCase().includes('android');

  const formattedDate = new Date(session.lastActiveAt).toLocaleString();

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border bg-cardard transition-all duration-300',
        session.isCurrent
          ? 'border-primary/20 bg-primary/5 hover:border-primary/30 shadow-sm'
          : 'border-border/80 hover:border-border',
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-semibold',
            session.isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
          )}
        >
          {isMobile ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </div>

        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="font-semibold text-foreground text-sm leading-none">
              {session.browser} on {session.os}
            </h4>
            {session.isCurrent && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-500 uppercase tracking-wider border border-emerald-500/20">
                <CheckCircle2 className="w-2 h-2" />
                Current Session
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground font-medium">{session.device}</p>

          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground/80">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 shrink-0" />
              IP: {session.ip} {session.location && `(${session.location})`}
            </span>
            <span>&bull;</span>
            <span>Last active: {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Revocation Trigger Button */}
      {!session.isCurrent && (
        <button
          onClick={() => onTerminate(session.id)}
          disabled={isTerminating}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/15 font-semibold text-xs transition-colors shrink-0 disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          {isTerminating ? 'Terminating...' : 'Terminate Session'}
        </button>
      )}
    </div>
  );
}

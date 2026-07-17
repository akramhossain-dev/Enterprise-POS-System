'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

type ServiceStatus = 'online' | 'degraded' | 'offline';

interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  latency?: number; // ms
}

const STATUS_CONFIG: Record<
  ServiceStatus,
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  online: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Online' },
  degraded: { icon: AlertCircle, color: 'text-amber-500', label: 'Degraded' },
  offline: { icon: AlertCircle, color: 'text-red-500', label: 'Offline' },
};

// Simulated service statuses
const SERVICES: Service[] = [
  { id: 'api', name: 'API Server', status: 'online', latency: 24 },
  { id: 'db', name: 'Database', status: 'online', latency: 8 },
  { id: 'cache', name: 'Cache (Redis)', status: 'online', latency: 2 },
  { id: 'storage', name: 'File Storage', status: 'online', latency: 45 },
  { id: 'email', name: 'Email Service', status: 'degraded', latency: 320 },
];

export function SystemStatus() {
  const [lastChecked, setLastChecked] = useState(new Date());
  const [checking, setChecking] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refresh = () => {
    setChecking(true);
    setTimeout(() => {
      setLastChecked(new Date());
      setChecking(false);
    }, 1000);
  };

  const allOnline = SERVICES.every((s) => s.status === 'online');

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              allOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse',
            )}
          />
          <span className="text-xs font-medium text-foreground">
            {allOnline ? 'All systems operational' : 'Partial degradation'}
          </span>
        </div>
        <button
          onClick={refresh}
          disabled={checking}
          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          aria-label="Refresh status"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', checking && 'animate-spin')} />
        </button>
      </div>

      {/* Services */}
      <div className="space-y-1.5">
        {SERVICES.map((service, i) => {
          const cfg = STATUS_CONFIG[service.status];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40 transition-colors"
            >
              <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', cfg.color)} />
              <span className="flex-1 text-xs text-foreground">{service.name}</span>
              {service.latency !== undefined && (
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {service.latency}ms
                </span>
              )}
              <span className={cn('text-[10px] font-medium', cfg.color)}>{cfg.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Last checked */}
      <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Last checked:{' '}
        {mounted
          ? lastChecked.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          : '—'}
      </p>
    </div>
  );
}

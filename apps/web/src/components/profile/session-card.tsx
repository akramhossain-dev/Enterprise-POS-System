'use client';

import { Monitor, Smartphone, Tablet, MapPin, Clock, Trash2, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatRelative } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import type { ActiveSession } from '@/types/auth';

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

interface SessionCardProps {
  session: ActiveSession;
  onRevoke: (id: string) => void;
  isRevoking?: boolean;
}

export function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const deviceType = session.device.toLowerCase().includes('mobile')
    ? 'mobile'
    : session.device.toLowerCase().includes('tablet')
      ? 'tablet'
      : 'desktop';

  const DeviceIcon = DEVICE_ICONS[deviceType] ?? Monitor;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className={cn(
        'flex items-start gap-4 p-4 rounded-[--radius-lg] border transition-colors',
        session.isCurrent
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-card hover:bg-muted/30',
      )}
    >
      {/* Device icon */}
      <div
        className={cn(
          'shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          session.isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <DeviceIcon className="w-5 h-5" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground truncate">
            {session.browser} on {session.os}
          </span>
          {session.isCurrent && (
            <Badge variant="success" dot className="text-xs">
              This device
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {session.ip && (
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              {session.ip}
            </span>
          )}
          {session.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {session.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Active {formatRelative(session.lastActiveAt)}
          </span>
        </div>
      </div>

      {/* Revoke */}
      {!session.isCurrent && (
        <Button
          variant="ghost"
          size="sm"
          loading={isRevoking}
          onClick={() => onRevoke(session.id)}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          className="text-destructive hover:text-destructive shrink-0"
        >
          Revoke
        </Button>
      )}
    </motion.div>
  );
}

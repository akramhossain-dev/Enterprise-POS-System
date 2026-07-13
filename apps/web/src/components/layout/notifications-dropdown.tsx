'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Popover from '@radix-ui/react-popover';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ShoppingCart,
  Package,
  CreditCard,
  Info,
  AlertTriangle,
  Zap,
  X,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';
import { formatRelative } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Notification, NotificationType } from '@/types/notification';

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  success: { icon: Check, color: 'text-green-500', bg: 'bg-green-500/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  error: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  sale: { icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
  stock: { icon: Package, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  payment: { icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  system: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
};

function NotificationItem({
  n,
  onRead,
  onRemove,
}: {
  n: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[n.type];
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className={cn(
        'flex items-start gap-3 px-3 py-3 rounded-lg transition-colors group relative',
        n.isRead ? 'opacity-60' : 'bg-accent/30',
        'hover:bg-accent/50',
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          cfg.bg,
        )}
      >
        <Icon className={cn('w-4 h-4', cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground leading-snug">{n.title}</p>
        {n.body && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.body}</p>}
        <p className="text-[10px] text-muted-foreground/60 mt-1">{formatRelative(n.createdAt)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {!n.isRead && (
          <button
            onClick={() => onRead(n.id)}
            title="Mark as read"
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <Check className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => onRemove(n.id)}
          title="Remove"
          className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {!n.isRead && (
        <span className="absolute top-3 right-10 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
      )}
    </motion.div>
  );
}

export function NotificationsDropdown() {
  const {
    notifications,
    unreadCount,
    notificationsOpen,
    setNotificationsOpen,
    markRead,
    markAllRead,
    removeNotification,
  } = useUIStore();

  return (
    <Popover.Root open={notificationsOpen} onOpenChange={setNotificationsOpen}>
      <Popover.Trigger asChild>
        <button
          id="notifications-trigger"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center leading-none"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          className="z-[1060] w-80 rounded-xl border border-border bg-background shadow-2xl shadow-black/10 overflow-hidden"
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-semibold text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
                <AnimatePresence>
                  {notifications.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-10 gap-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">All caught up! 🎉</p>
                    </motion.div>
                  ) : (
                    notifications.map((n) => (
                      <NotificationItem
                        key={n.id}
                        n={n}
                        onRead={markRead}
                        onRemove={removeNotification}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

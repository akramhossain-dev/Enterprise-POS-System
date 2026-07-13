'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Tooltip from '@radix-ui/react-tooltip';
import { navigationConfig } from '@/config/navigation';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { WorkspaceSwitcher } from './workspace-switcher';
import { cn } from '@/utils/cn';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleSidebarCollapsed } = useUIStore();
  const { hasPermission, user } = useAuthStore();

  const isActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(href + '/'),
    [pathname],
  );

  const filteredNavigation = navigationConfig.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || hasPermission(item.permission)),
  }));

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <Tooltip.Provider delayDuration={300}>
      <>
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          id="sidebar"
          role="navigation"
          aria-label="Main navigation"
          className={cn(
            'fixed left-0 top-0 z-50 h-full flex flex-col',
            'bg-sidebar border-r border-sidebar-border',
            'transition-[width] duration-300 ease-in-out',
            // Desktop
            'hidden md:flex',
            sidebarCollapsed ? 'md:w-16' : 'md:w-64',
            // Mobile
            'max-md:flex max-md:w-72',
            sidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
            'max-md:transition-transform',
          )}
        >
          {/* Workspace Switcher */}
          <WorkspaceSwitcher collapsed={sidebarCollapsed} />

          {/* Mobile close */}
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 md:hidden p-1.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Navigation */}
          <ScrollArea.Root className="flex-1 overflow-hidden">
            <ScrollArea.Viewport className="w-full h-full py-3 px-2">
              {filteredNavigation.map((section) =>
                section.items.length === 0 ? null : (
                  <div key={section.id} className="mb-4">
                    {!sidebarCollapsed && (
                      <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                        {section.label}
                      </p>
                    )}
                    {sidebarCollapsed && (
                      <div className="mb-2 mx-auto w-6 h-px bg-sidebar-border" />
                    )}
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const active = isActive(item.href);
                        const link = (
                          <Link
                            key={item.id}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                              sidebarCollapsed && 'justify-center px-0',
                              active
                                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            )}
                          >
                            <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            {!sidebarCollapsed && (
                              <>
                                <span className="flex-1 truncate">{item.label}</span>
                                {item.badge !== undefined && (
                                  <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                                    {item.badge}
                                  </span>
                                )}
                              </>
                            )}
                          </Link>
                        );

                        if (sidebarCollapsed) {
                          return (
                            <Tooltip.Root key={item.id}>
                              <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  side="right"
                                  sideOffset={10}
                                  className="z-[1080] px-2.5 py-1.5 rounded-lg bg-popover border border-border text-xs font-medium text-popover-foreground shadow-lg"
                                >
                                  {item.label}
                                  <Tooltip.Arrow className="fill-border" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          );
                        }
                        return link;
                      })}
                    </div>
                  </div>
                ),
              )}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="vertical"
              className="flex w-1.5 touch-none select-none p-0.5 transition-colors hover:bg-sidebar-accent"
            >
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-sidebar-border" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          {/* Sidebar footer — user avatar shortcut */}
          {!sidebarCollapsed && (
            <div className="flex-shrink-0 px-3 py-3 border-t border-sidebar-border">
              <Link
                href="/settings/profile"
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-semibold">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-sidebar-foreground truncate">
                    {user?.fullName ?? 'My Account'}
                  </p>
                  <p className="text-[10px] text-sidebar-foreground/50 truncate capitalize">
                    {user?.role ?? '—'}
                  </p>
                </div>
              </Link>
            </div>
          )}

          {/* Collapse toggle (desktop) */}
          <div className="flex-shrink-0 p-2 border-t border-sidebar-border hidden md:flex">
            <button
              onClick={toggleSidebarCollapsed}
              className={cn(
                'flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm',
                'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
                sidebarCollapsed && 'justify-center',
              )}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-xs">Collapse</span>
                </>
              )}
            </button>
          </div>
        </aside>
      </>
    </Tooltip.Provider>
  );
}

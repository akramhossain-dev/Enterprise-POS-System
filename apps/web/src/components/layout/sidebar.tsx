'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { navigationConfig } from '@/config/navigation';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/utils/cn';
import { appConfig } from '@/config/app';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleSidebarCollapsed } = useUIStore();
  const { hasPermission } = useAuthStore();

  const isActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(href + '/'),
    [pathname],
  );

  const filteredNavigation = navigationConfig.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || hasPermission(item.permission)),
  }));

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
          'transition-all duration-300 ease-in-out',
          // Desktop collapsed/expanded
          'hidden md:flex',
          sidebarCollapsed ? 'w-16' : 'w-64',
          // Mobile
          'max-md:flex max-md:w-72',
          sidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-sidebar-border flex-shrink-0">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-xs">EP</span>
              </div>
              <span className="font-semibold text-sm text-sidebar-foreground truncate">
                {appConfig.shortName}
              </span>
            </Link>
          )}

          {sidebarCollapsed && (
            <Link href="/dashboard" className="mx-auto">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">EP</span>
              </div>
            </Link>
          )}

          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {filteredNavigation.map((section) =>
            section.items.length === 0 ? null : (
              <div key={section.id} className="mb-4">
                {!sidebarCollapsed && (
                  <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={cn(
                          'flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                          sidebarCollapsed && 'justify-center',
                          active
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                        {!sidebarCollapsed && item.badge !== undefined && (
                          <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ),
          )}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="flex-shrink-0 p-2 border-t border-sidebar-border hidden md:flex">
          <button
            onClick={toggleSidebarCollapsed}
            className={cn(
              'flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm',
              'text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
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
  );
}

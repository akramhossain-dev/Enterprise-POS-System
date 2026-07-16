'use client';

import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNavbar } from '@/components/layout/top-navbar';
import { DashboardFooter } from '@/components/layout/dashboard-footer';
import { CommandPalette } from '@/components/layout/command-palette';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/utils/cn';
import { useSessionTimeout } from '@/hooks/use-session-timeout';
import { OfflineBanner } from '@/components/common/offline-banner';
import { ErrorBoundary } from '@/components/common/error-boundary';

interface DashboardLayoutClientProps {
  children: ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const { sidebarCollapsed } = useUIStore();

  useSessionTimeout();

  return (
    <div className="min-h-dvh bg-background flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area — pushes right by sidebar width */}
      <div
        className={cn(
          'flex flex-col flex-1 min-w-0 transition-[margin] duration-300 ease-in-out',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64',
          'max-[768px]:ml-0',
        )}
      >
        <OfflineBanner />
        <TopNavbar />
        <main
          id="main-content"
          className="flex-1 overflow-auto p-4 sm:p-6"
          role="main"
          aria-label="Main content"
        >
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <DashboardFooter />
      </div>

      {/* Global overlays */}
      <CommandPalette />
    </div>
  );
}

'use client';

import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNavbar } from '@/components/layout/top-navbar';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/utils/cn';

interface DashboardLayoutClientProps {
  children: ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-dvh bg-background flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'ml-16' : 'ml-64',
          'max-[768px]:ml-0',
        )}
      >
        <TopNavbar />
        <main id="main-content" className="flex-1 p-6 overflow-auto" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}

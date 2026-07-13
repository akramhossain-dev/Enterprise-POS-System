'use client';

import { Menu, Bell, Search } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';
import { ThemeSwitcher } from './theme-switcher';
import { UserMenu } from './user-menu';
import { Breadcrumb } from './breadcrumb';

export function TopNavbar() {
  const { toggleSidebar, setCommandPaletteOpen } = useUIStore();

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
    >
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 h-8 px-3 rounded-lg text-sm text-muted-foreground border border-border bg-background hover:border-primary/50 hover:text-foreground transition-all duration-150"
          aria-label="Search (Ctrl+K)"
          id="global-search-trigger"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">Search…</span>
          <kbd className="hidden sm:inline text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Notifications"
          id="notifications-trigger"
        >
          <Bell className="w-4 h-4" />
          {/* Unread dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border-2 border-background"
            aria-hidden="true"
          />
        </button>

        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* User menu */}
        <UserMenu />
      </div>
    </header>
  );
}

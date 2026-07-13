'use client';

import { useState, useEffect, useCallback } from 'react';
import { Menu, Search, Maximize2, Minimize2, Clock } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';
import { ThemeSwitcher } from './theme-switcher';
import { UserMenu } from './user-menu';
import { Breadcrumb } from './breadcrumb';
import { NotificationsDropdown } from './notifications-dropdown';
import { QuickActionsMenu } from './quick-actions-menu';

function LiveClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums select-none">
      <Clock className="w-3 h-3" aria-hidden="true" />
      {time}
    </span>
  );
}

function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      void document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <button
      onClick={toggle}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      className="hidden sm:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
    </button>
  );
}

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
        {/* Live clock */}
        <LiveClock />

        {/* Separator */}
        <div className="hidden lg:block w-px h-5 bg-border mx-1" />

        {/* Search / Command Palette trigger */}
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

        {/* Quick Actions */}
        <QuickActionsMenu />

        {/* Fullscreen */}
        <FullscreenToggle />

        {/* Notifications */}
        <NotificationsDropdown />

        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* User menu */}
        <UserMenu />
      </div>
    </header>
  );
}

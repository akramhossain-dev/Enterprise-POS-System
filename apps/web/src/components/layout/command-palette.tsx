'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Settings, Users, Package, ShoppingCart, X } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/utils/cn';

const commands = [
  {
    group: 'Navigation',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { id: 'inventory', label: 'Inventory', href: '/inventory', icon: Package },
      { id: 'sales', label: 'Sales', href: '/sales', icon: ShoppingCart },
      { id: 'customers', label: 'Customers', href: '/customers', icon: Users },
      { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();

  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  const handleSelect = (href: string) => {
    setCommandPaletteOpen(false);
    router.push(href);
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1089] bg-black/60 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
            aria-hidden="true"
          />

          {/* Command panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/4 -translate-x-1/2 z-[1090] w-full max-w-xl"
          >
            <Command
              className={cn(
                'rounded-xl border border-border bg-background shadow-2xl overflow-hidden',
              )}
              aria-label="Command palette"
            >
              <div className="flex items-center gap-2 px-4 border-b border-border">
                <Search
                  className="w-4 h-4 text-muted-foreground flex-shrink-0"
                  aria-hidden="true"
                />
                <Command.Input
                  autoFocus
                  placeholder="Search commands, pages…"
                  className="flex-1 h-12 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                  aria-label="Search"
                />
                <button
                  onClick={() => setCommandPaletteOpen(false)}
                  className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Close command palette"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <Command.List className="max-h-72 overflow-y-auto p-2">
                <Command.Empty className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  No results found
                </Command.Empty>

                {commands.map((group) => (
                  <Command.Group
                    key={group.group}
                    heading={group.group}
                    className="[&>[cmdk-group-heading]]:px-2 [&>[cmdk-group-heading]]:py-1.5 [&>[cmdk-group-heading]]:text-xs [&>[cmdk-group-heading]]:font-semibold [&>[cmdk-group-heading]]:text-muted-foreground [&>[cmdk-group-heading]]:uppercase [&>[cmdk-group-heading]]:tracking-wider"
                  >
                    {group.items.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={item.label}
                        onSelect={() => handleSelect(item.href)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer',
                          'text-foreground hover:bg-accent transition-colors',
                          'data-[selected=true]:bg-accent',
                          'outline-none',
                        )}
                        id={`command-${item.id}`}
                      >
                        <item.icon
                          className="w-4 h-4 text-muted-foreground flex-shrink-0"
                          aria-hidden="true"
                        />
                        {item.label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>

              <div className="px-4 py-2 border-t border-border flex items-center gap-3 text-xs text-muted-foreground">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

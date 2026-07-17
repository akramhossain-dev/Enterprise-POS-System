'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/utils/cn';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (themes.find((t) => t.value === theme) ?? themes[2]) : themes[2];
  const Icon = currentTheme.icon;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-1 p-2 rounded-lg',
            'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label="Switch theme"
          id="theme-switcher-trigger"
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
          <ChevronDown className="w-3 h-3" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-[1060] min-w-[140px] rounded-xl border border-border bg-popover p-1 shadow-lg',
            'animate-scale-in',
          )}
          sideOffset={8}
          align="end"
        >
          {themes.map(({ value, label, icon: ItemIcon }) => (
            <DropdownMenu.Item
              key={value}
              onSelect={() => setTheme(value)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer outline-none transition-colors',
                theme === value
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-popover-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <ItemIcon className="w-4 h-4" aria-hidden="true" />
              {label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

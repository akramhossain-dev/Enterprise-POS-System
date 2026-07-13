'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown, Check, GitBranch } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/utils/cn';

interface Workspace {
  id: string;
  name: string;
  logo?: string;
}

interface Branch {
  id: string;
  name: string;
  isMain?: boolean;
}

const DEMO_WORKSPACES: Workspace[] = [
  { id: '1', name: 'Enterprise POS Co.' },
  { id: '2', name: 'Retail Group Ltd.' },
];

const DEMO_BRANCHES: Branch[] = [
  { id: '1', name: 'Main Store', isMain: true },
  { id: '2', name: 'Downtown Branch' },
  { id: '3', name: 'Warehouse' },
];

export function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const [activeWorkspace, setActiveWorkspace] = useState(DEMO_WORKSPACES[0]!);
  const [activeBranch, setActiveBranch] = useState(DEMO_BRANCHES[0]!);
  const [open, setOpen] = useState(false);

  if (collapsed) {
    return (
      <div className="flex items-center justify-center px-3 py-3 border-b border-sidebar-border">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
          <span className="text-primary-foreground font-bold text-xs">
            {activeWorkspace.name.charAt(0)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-b border-sidebar-border space-y-1">
      {/* Company Selector */}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            className={cn(
              'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg',
              'text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
            )}
            aria-label="Switch workspace"
          >
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/20">
              <span className="text-primary-foreground font-bold text-[10px]">
                {activeWorkspace.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">
                {activeWorkspace.name}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-sidebar-foreground/50 transition-transform duration-200 flex-shrink-0',
                open && 'rotate-180',
              )}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="right"
            align="start"
            sideOffset={8}
            className="z-[1070] w-56 rounded-xl border border-border bg-popover p-1.5 shadow-xl shadow-black/10"
          >
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Workspaces
                </p>
                {DEMO_WORKSPACES.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-popover-foreground hover:bg-accent transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="flex-1 text-left truncate">{ws.name}</span>
                    {activeWorkspace.id === ws.id && (
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Branch Selector */}
      <div className="flex items-center gap-1.5 px-2 py-1">
        <GitBranch className="w-3 h-3 text-sidebar-foreground/40 flex-shrink-0" />
        <select
          value={activeBranch.id}
          onChange={(e) => {
            const branch = DEMO_BRANCHES.find((b) => b.id === e.target.value);
            if (branch) setActiveBranch(branch);
          }}
          className="flex-1 bg-transparent text-[11px] text-sidebar-foreground/70 outline-none cursor-pointer min-w-0"
          aria-label="Select branch"
        >
          {DEMO_BRANCHES.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

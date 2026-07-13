'use client';

import { motion, AnimatePresence } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Plus, ShoppingCart, Package, Users, FileText, CreditCard, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

const QUICK_ACTIONS = [
  {
    id: 'new-sale',
    label: 'New Sale',
    icon: ShoppingCart,
    href: '/pos',
    color: 'text-primary',
    kbd: 'N',
  },
  {
    id: 'new-product',
    label: 'New Product',
    icon: Package,
    href: '/inventory',
    color: 'text-violet-500',
    kbd: 'P',
  },
  {
    id: 'new-customer',
    label: 'New Customer',
    icon: Users,
    href: '/customers',
    color: 'text-emerald-500',
    kbd: 'C',
  },
  {
    id: 'new-invoice',
    label: 'New Invoice',
    icon: FileText,
    href: '/accounting',
    color: 'text-amber-500',
    kbd: 'I',
  },
  {
    id: 'new-purchase',
    label: 'New Purchase',
    icon: CreditCard,
    href: '/purchase',
    color: 'text-red-500',
    kbd: null,
  },
];

export function QuickActionsMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          id="quick-actions-trigger"
          aria-label="Quick actions"
          className={cn(
            'flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium',
            'text-muted-foreground border border-border bg-background',
            'hover:text-foreground hover:border-primary/40 hover:bg-accent transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Quick</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[1060] min-w-[190px] rounded-xl border border-border bg-popover p-1.5 shadow-xl shadow-black/10"
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12 }}
            >
              <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Create New
              </p>
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenu.Item key={action.id} asChild>
                    <a
                      href={action.href}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-popover-foreground hover:bg-accent transition-colors cursor-pointer outline-none"
                      id={`quick-action-${action.id}`}
                    >
                      <Icon className={cn('w-4 h-4', action.color)} />
                      <span className="flex-1">{action.label}</span>
                      {action.kbd && (
                        <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                          {action.kbd}
                        </kbd>
                      )}
                    </a>
                  </DropdownMenu.Item>
                );
              })}

              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item asChild>
                <a
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors cursor-pointer outline-none"
                  id="quick-action-dashboard"
                >
                  <Plus className="w-4 h-4" />
                  More actions…
                </a>
              </DropdownMenu.Item>
            </motion.div>
          </AnimatePresence>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

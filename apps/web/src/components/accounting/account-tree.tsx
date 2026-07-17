'use client';

import React, { useState } from 'react';
import type { ChartAccount } from '@/types/accounting';
import { ChevronRight, ChevronDown, FolderOpen, FileText, Eye, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BalanceBadge } from './balance-badge';
import Link from 'next/link';

interface AccountTreeProps {
  accounts: ChartAccount[];
  onArchive: (id: string) => void;
}

export function AccountTree({ accounts, onArchive }: AccountTreeProps) {
  // Store expanded account codes
  const [expandedCodes, setExpandedCodes] = useState<Record<string, boolean>>({
    '1000': true, // Auto-expand core parent groups by default
    '2000': true,
  });

  const toggleExpand = (code: string) => {
    setExpandedCodes((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  // Group accounts by parent account code
  const parentMap: Record<string, ChartAccount[]> = {};
  const rootAccounts: ChartAccount[] = [];

  accounts.forEach((acc) => {
    if (acc.parentAccountCode) {
      if (!parentMap[acc.parentAccountCode]) {
        parentMap[acc.parentAccountCode] = [];
      }
      parentMap[acc.parentAccountCode]!.push(acc);
    } else {
      rootAccounts.push(acc);
    }
  });

  // Sort by code order
  rootAccounts.sort((a, b) => a.code.localeCompare(b.code));
  Object.keys(parentMap).forEach((key) => {
    parentMap[key]!.sort((a, b) => a.code.localeCompare(b.code));
  });

  // Recursive Tree Node Renderer
  const renderNode = (account: ChartAccount, depth: number = 0) => {
    const children = parentMap[account.code] || [];
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedCodes[account.code];

    return (
      <div key={account.id} className="select-none text-left">
        {/* Node row */}
        <div
          className="flex items-center justify-between p-2.5 border-b border-border hover:bg-accent/40 text-xs sm:text-sm text-foreground transition-colors"
          style={{ paddingLeft: `${depth * 20 + 10}px` }}
        >
          <div className="flex items-center space-x-2 min-w-0">
            {/* Expand / Collapse toggle */}
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(account.code)}
                className="h-5 w-5 text-muted-foreground hover:text-foreground flex items-center justify-center rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}

            {/* Icon */}
            {hasChildren ? (
              <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            )}

            {/* Details */}
            <span className="font-mono text-muted-foreground font-bold shrink-0">{account.code}</span>
            <span className="font-semibold truncate text-foreground">{account.name}</span>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            {/* Balance Type badges */}
            <BalanceBadge type={account.balanceType} />

            {/* Balance */}
            <span className="font-mono font-bold text-foreground min-w-[90px] text-right">
              $
              {account.balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>

            {/* Actions toolbar */}
            <div className="flex items-center space-x-1">
              <Link href={`/accounting/accounts/${account.id}`}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-emerald-400 hover:bg-muted"
                  title="View Account"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href={`/accounting/accounts/${account.id}/edit`}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-amber-400 hover:bg-muted"
                  title="Edit Account"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onArchive(account.id)}
                className="h-7 w-7 text-muted-foreground hover:text-rose-455 hover:bg-muted"
                title="Archive Account"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Children Render (Recursion) */}
        {hasChildren && isExpanded && (
          <div className="transition-all duration-300">
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-cardard border border-border rounded-2xl overflow-hidden divide-y divide-border">
      {/* Header bar */}
      <div className="flex items-center justify-between p-3 bg-muted/40 text-[10px] text-muted-foreground uppercase font-black tracking-widest text-left">
        <div className="pl-6">Account Code & Name</div>
        <div className="flex items-center space-x-12 pr-6">
          <span>Balance Type</span>
          <span className="min-w-[90px] text-right">Balance ($)</span>
          <span className="w-24 text-center">Actions</span>
        </div>
      </div>

      <div className="divide-y divide-slate-950">
        {rootAccounts.length > 0 ? (
          rootAccounts.map((root) => renderNode(root, 0))
        ) : (
          <div className="text-center py-10 text-muted-foreground text-xs">
            No chart accounts registered.
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { ShoppingCart, Package, FileText, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PurchaseHistoryPlaceholderProps {
  activeTab?: 'orders' | 'grn' | 'invoices' | 'returns';
  className?: string;
}

const tabs = [
  { id: 'orders' as const, label: 'Purchase Orders', icon: ShoppingCart },
  { id: 'grn' as const, label: 'GRN', icon: Package },
  { id: 'invoices' as const, label: 'Invoices', icon: FileText },
  { id: 'returns' as const, label: 'Returns', icon: RotateCcw },
] as const;

const descriptions: Record<PurchaseHistoryPlaceholderProps['activeTab'] & string, string> = {
  orders: 'Purchase orders placed with this supplier will appear here.',
  grn: 'Goods received notes (GRN) from this supplier will appear here.',
  invoices: 'Supplier invoices will appear here.',
  returns: 'Purchase returns to this supplier will appear here.',
};

export function PurchaseHistoryPlaceholder({
  activeTab = 'orders',
  className,
}: PurchaseHistoryPlaceholderProps) {
  const [currentTab, setCurrentTab] = React.useState(activeTab);
  const Icon = tabs.find((t) => t.id === currentTab)?.icon ?? ShoppingCart;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              currentTab === tab.id
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Coming-soon placeholder */}
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl bg-muted/20">
        <Icon className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <p className="text-sm font-semibold text-muted-foreground">
          {tabs.find((t) => t.id === currentTab)?.label} — Coming Soon
        </p>
        <p className="text-xs text-muted-foreground/70 mt-2 max-w-xs">{descriptions[currentTab]}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-4 font-mono">
          Purchase Module — Phase B7
        </p>
      </div>
    </div>
  );
}

import * as React from 'react';

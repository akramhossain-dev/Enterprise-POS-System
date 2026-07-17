'use client';

import * as React from 'react';
import { useProducts } from '@/hooks/use-product';
import { cn } from '@/utils/cn';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProductSelectorProps {
  onSelect: (product: {
    id: string;
    name: string;
    sku: string;
    unitPrice: number;
    taxRate: number;
  }) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export function ProductSelector({
  onSelect,
  excludeIds = [],
  placeholder = 'Type product name or SKU to purchase...',
}: ProductSelectorProps) {
  const [q, setQ] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { data: response, isLoading } = useProducts({
    q: q || undefined,
    limit: 10,
  });

  const products = response?.data || [];

  const list = React.useMemo(() => {
    return products
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || '',
        unitPrice: Number(p.purchasePrice || p.sellingPrice || 0), // Use purchaseCost if available, fallback to retail price
        taxRate: Number(p.tax?.percentage || 0),
      }))
      .filter((p) => !excludeIds.includes(p.id));
  }, [products, excludeIds]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 bg-cardard border-border"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && (q.length > 0 || list.length > 0) && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-lg">
          {list.length === 0 ? (
            <p className="p-3 text-xs text-muted-foreground text-center">
              No matching products found
            </p>
          ) : (
            list.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item);
                  setQ('');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-muted/40 transition-colors flex flex-col gap-0.5 text-xs text-foreground font-medium border-b border-border/30 last:border-b-0"
              >
                <span className="font-semibold text-sm">{item.name}</span>
                <span className="text-muted-foreground text-[10px] uppercase font-mono">
                  SKU: {item.sku || 'N/A'} | Price: ${item.unitPrice.toFixed(2)} | Tax:{' '}
                  {item.taxRate}%
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

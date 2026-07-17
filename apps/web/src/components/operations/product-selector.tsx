'use client';

import * as React from 'react';
import { useProducts } from '@/hooks/use-product';
import { useInventoryList } from '@/hooks/use-inventory';
import { cn } from '@/utils/cn';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProductSelectorProps {
  warehouseId?: string; // If provided, limits products to what is in stock at this warehouse
  onSelect: (product: {
    id: string;
    name: string;
    sku?: string | null;
    availableQuantity?: number;
  }) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export function ProductSelector({
  warehouseId,
  onSelect,
  excludeIds = [],
  placeholder = 'Type product name or SKU to search...',
}: ProductSelectorProps) {
  const [q, setQ] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // If warehouseId is specified, search in active warehouse inventory. Otherwise search generic products catalog.
  const { data: inventoryResponse, isLoading: invLoading } = useInventoryList({
    warehouseId: warehouseId || undefined,
    q: q || undefined,
    limit: 10,
  });

  const { data: catalogResponse, isLoading: catalogLoading } = useProducts({
    q: q || undefined,
    limit: 10,
  });

  const isLoading = warehouseId ? invLoading : catalogLoading;

  const list = React.useMemo(() => {
    if (warehouseId) {
      return (inventoryResponse?.data || [])
        .map((inv) => ({
          id: inv.productId,
          name: inv.product?.name || '—',
          sku: inv.product?.sku || '',
          availableQuantity: Number(inv.availableQuantity),
        }))
        .filter((item) => !excludeIds.includes(item.id));
    } else {
      return (catalogResponse?.data || [])
        .map((prod) => ({
          id: prod.id,
          name: prod.name,
          sku: prod.sku || '',
          availableQuantity: undefined,
        }))
        .filter((item) => !excludeIds.includes(item.id));
    }
  }, [warehouseId, inventoryResponse, catalogResponse, excludeIds]);

  // Click outside to close dropdown
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
                  SKU: {item.sku || 'N/A'}
                  {item.availableQuantity !== undefined &&
                    ` | In-Stock: ${item.availableQuantity.toFixed(2)}`}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

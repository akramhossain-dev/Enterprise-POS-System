'use client';

import * as React from 'react';
import { useWarehouses } from '@/hooks/use-warehouse';
import { cn } from '@/utils/cn';

interface WarehouseSelectorProps {
  value: string;
  onChange: (id: string) => void;
  excludeId?: string;
  placeholder?: string;
  className?: string;
  error?: string;
}

export function WarehouseSelector({
  value,
  onChange,
  excludeId,
  placeholder = 'Select Warehouse Depot...',
  className,
  error,
}: WarehouseSelectorProps) {
  const { data: response, isLoading } = useWarehouses();
  const warehouses = response?.data || [];

  const filtered = excludeId
    ? warehouses.filter((w) => w.id !== excludeId && w.status === 'ACTIVE')
    : warehouses.filter((w) => w.status === 'ACTIVE');

  return (
    <div className="space-y-1.5 w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className={cn(
          'w-full text-sm rounded-lg border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary',
          error ? 'border-rose-500 focus:ring-rose-500' : 'border-border focus:ring-primary',
          className,
        )}
      >
        <option value="">{isLoading ? 'Loading depots...' : placeholder}</option>
        {filtered.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name} ({w.code})
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

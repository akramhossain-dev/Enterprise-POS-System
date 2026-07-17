'use client';

import * as React from 'react';
import { useSuppliers } from '@/hooks/use-supplier';
import { cn } from '@/utils/cn';

interface SupplierSelectorProps {
  value: string;
  onChange: (id: string, name: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export function SupplierSelector({
  value,
  onChange,
  placeholder = 'Select Supplier vendor...',
  className,
  error,
}: SupplierSelectorProps) {
  const { data: response, isLoading } = useSuppliers({
    page: 1,
    limit: 100,
  });

  const suppliers = response?.data || [];

  const activeSuppliers = suppliers.filter((s) => s.status === 'ACTIVE');

  return (
    <div className="space-y-1.5 w-full">
      <select
        value={value}
        onChange={(e) => {
          const id = e.target.value;
          const found = activeSuppliers.find((s) => s.id === id);
          onChange(id, found?.companyName || '');
        }}
        disabled={isLoading}
        className={cn(
          'w-full text-sm rounded-lg border bg-card p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary',
          error ? 'border-rose-500 focus:ring-rose-500' : 'border-border focus:ring-primary',
          className,
        )}
      >
        <option value="">{isLoading ? 'Loading vendors...' : placeholder}</option>
        {activeSuppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.companyName}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

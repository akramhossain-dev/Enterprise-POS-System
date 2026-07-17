'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface BatchSelectorProps {
  batchNumber: string;
  expiryDate: string;
  onChangeBatch: (val: string) => void;
  onChangeExpiry: (val: string) => void;
  disabled?: boolean;
}

export function BatchSelector({
  batchNumber,
  expiryDate,
  onChangeBatch,
  onChangeExpiry,
  disabled = false,
}: BatchSelectorProps) {
  return (
    <div className="flex gap-2 items-center text-xs">
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] text-muted-foreground uppercase font-bold">Batch Code</label>
        <Input
          value={batchNumber}
          onChange={(e) => onChangeBatch(e.target.value)}
          disabled={disabled}
          placeholder="BATCH-1234"
          className="h-8 w-28 bg-cardard border-border font-semibold text-xs"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] text-muted-foreground uppercase font-bold">Expiry Date</label>
        <div className="relative">
          <Input
            type="date"
            value={expiryDate}
            onChange={(e) => onChangeExpiry(e.target.value)}
            disabled={disabled}
            className="h-8 w-32 bg-cardard border-border font-semibold text-xs pl-2"
          />
        </div>
      </div>
    </div>
  );
}

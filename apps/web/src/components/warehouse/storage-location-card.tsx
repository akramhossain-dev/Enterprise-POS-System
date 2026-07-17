'use client';

import React from 'react';
import { LayoutGrid, Edit, Trash2, CheckCircle2, XCircle, QrCode } from 'lucide-react';
import type { StorageLocation } from '@/types/warehouse';
import { cn } from '@/utils/cn';

interface StorageLocationCardProps {
  location: StorageLocation;
  onEdit?: (loc: StorageLocation) => void;
  onDelete?: (id: string) => void;
}

export function StorageLocationCard({ location, onEdit, onDelete }: StorageLocationCardProps) {
  return (
    <div className="group rounded-2xl border border-border bg-cardard p-4 flex flex-col justify-between transition-all hover:border-primary/20 hover:shadow-md text-left">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayoutGrid className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm leading-tight">
                {location.zone}
              </h4>
              <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                {location.rack} &bull; {location.shelf}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border',
              location.status === 'ACTIVE'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-muted text-muted-foreground border-border',
            )}
          >
            {location.status === 'ACTIVE' ? (
              <CheckCircle2 className="w-2.5 h-2.5" />
            ) : (
              <XCircle className="w-2.5 h-2.5" />
            )}
            {location.status}
          </span>
        </div>

        {/* Bin detail box */}
        <div className="mt-3.5 bg-muted/40 p-2.5 rounded-xl border border-border/40 flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">
            Storage Bin:
          </span>
          <span className="font-bold text-foreground">{location.bin}</span>
        </div>

        {/* Barcode display */}
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/80">
          <QrCode className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />
          <span>Code: {location.barcode}</span>
        </div>
      </div>

      {/* Action Footer */}
      {(onEdit || onDelete) && (
        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
          <span className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
            {location.warehouseName ? location.warehouseName.slice(0, 18) + '...' : 'Location ID'}
          </span>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(location)}
                className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Edit Bin"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(location.id)}
                className="p-1 rounded text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                title="Delete Bin"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

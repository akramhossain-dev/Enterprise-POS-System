'use client';

import React from 'react';
import Link from 'next/link';
import { Warehouse as WarehouseIcon, Building2, User, Phone, ArrowRight } from 'lucide-react';
import type { Warehouse } from '@/types/warehouse';
import { UtilizationProgress } from './utilization-progress';
import { cn } from '@/utils/cn';

interface WarehouseCardProps {
  warehouse: Warehouse;
}

export function WarehouseCard({ warehouse }: WarehouseCardProps) {
  const cap = warehouse.metadata?.capacity ?? 5000;
  const util = warehouse.metadata?.utilization ?? 0;
  const isDefault = warehouse.isDefault;

  return (
    <div className="group rounded-2xl border border-border bg-cardard p-5 flex flex-col justify-between transition-all hover:border-primary/20 hover:shadow-md text-left">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <WarehouseIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1">
                {warehouse.name}
              </h3>
              <span className="block text-[10px] font-mono text-muted-foreground mt-0.5 uppercase tracking-wider">
                Code: {warehouse.code}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border',
                warehouse.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-muted text-muted-foreground border-border',
              )}
            >
              {warehouse.status}
            </span>
            {isDefault && (
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 text-[8px] font-bold text-indigo-500 uppercase tracking-widest">
                Default
              </span>
            )}
          </div>
        </div>

        {/* Manager & Branch details */}
        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          {warehouse.branch?.name && (
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              <span className="truncate">{warehouse.branch.name}</span>
            </div>
          )}
          {warehouse.managerName && (
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              <span>Mgr: {warehouse.managerName}</span>
            </div>
          )}
          {warehouse.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              <span>{warehouse.phone}</span>
            </div>
          )}
        </div>

        {/* Fill level progress */}
        <div className="mt-5 pt-4 border-t border-border/50">
          <UtilizationProgress value={util} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
        <span className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider font-mono">
          Vol Capacity: {cap.toLocaleString()} m³
        </span>
        <Link
          href={`/warehouses/${warehouse.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline hover:gap-1.5 transition-all"
        >
          Manage Depot
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

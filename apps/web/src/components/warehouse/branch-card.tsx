'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, User, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import type { Branch } from '@/types/warehouse';
import { cn } from '@/utils/cn';

interface BranchCardProps {
  branch: Branch;
  employeeCount?: number;
  warehouseCount?: number;
}

export function BranchCard({ branch, employeeCount = 0, warehouseCount = 0 }: BranchCardProps) {
  const city = branch.metadata?.city || 'General';
  const country = branch.metadata?.country || 'USA';
  const opening = branch.metadata?.openingDate;

  return (
    <div className="group rounded-2xl border border-border bg-cardard p-5 flex flex-col justify-between transition-all hover:border-primary/20 hover:shadow-md text-left">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1">
                {branch.name}
              </h3>
              <span className="block text-[9px] font-mono text-muted-foreground mt-0.5 uppercase tracking-wider">
                ID: {branch.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border',
              branch.status === 'ACTIVE'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-muted text-muted-foreground border-border',
            )}
          >
            {branch.status}
          </span>
        </div>

        {/* Info panel */}
        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          {branch.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              <span>{branch.phone}</span>
            </div>
          )}
          {branch.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              <span className="truncate">{branch.email}</span>
            </div>
          )}
          {branch.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              <span className="truncate">
                {branch.address}, {city}
              </span>
            </div>
          )}
        </div>

        {/* Counter cards summary */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 pt-4 border-t border-border/50">
          <div className="bg-muted/40 p-2 rounded-xl text-center">
            <span className="block text-[9px] text-muted-foreground/80 font-semibold uppercase tracking-wider">
              Staff Size
            </span>
            <span className="block mt-0.5 font-bold text-foreground text-sm font-mono">
              {employeeCount}
            </span>
          </div>
          <div className="bg-muted/40 p-2 rounded-xl text-center">
            <span className="block text-[9px] text-muted-foreground/80 font-semibold uppercase tracking-wider">
              Warehouses
            </span>
            <span className="block mt-0.5 font-bold text-foreground text-sm font-mono">
              {warehouseCount}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4 text-[10px] text-muted-foreground/70">
        <span>
          {opening ? `Opened: ${new Date(opening).toLocaleDateString()}` : 'Corporate Branch'}
        </span>
        <Link
          href={`/branches/${branch.id}`}
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline hover:gap-1.5 transition-all text-xs"
        >
          Branch Details
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

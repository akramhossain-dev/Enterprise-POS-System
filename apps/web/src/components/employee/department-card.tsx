'use client';

import React from 'react';
import { Network, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import type { Department } from '@/types/employee';

interface DepartmentCardProps {
  department: Department;
  employeeCount?: number;
  onEdit: (dept: Department) => void;
  onDelete: (id: string) => void;
}

export function DepartmentCard({
  department,
  employeeCount = 0,
  onEdit,
  onDelete,
}: DepartmentCardProps) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm md:text-base">
              {department.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {employeeCount} Assigned Employees
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase border ${
            department.status === 'ACTIVE'
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {department.status === 'ACTIVE' ? (
            <CheckCircle2 className="w-2.5 h-2.5" />
          ) : (
            <XCircle className="w-2.5 h-2.5" />
          )}
          {department.status}
        </span>
      </div>

      <p className="mt-4 text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
        {department.description || 'No description provided for this department.'}
      </p>

      {department.headName && (
        <div className="mt-3 bg-muted/40 rounded-lg p-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Department Head:</span>
          <span className="font-medium text-foreground">{department.headName}</span>
        </div>
      )}

      {/* Footer Controls */}
      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3">
        <span className="text-[10px] text-muted-foreground/60">
          Created {new Date(department.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(department)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Edit Department"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(department.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
            title="Delete Department"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, Calendar, ArrowRight, Building, Award } from 'lucide-react';
import type { Employee } from '@/types/employee';
import { cn } from '@/utils/cn';

interface EmployeeCardProps {
  employee: Employee;
  departmentName?: string;
  designationName?: string;
}

export function EmployeeCard({ employee, departmentName, designationName }: EmployeeCardProps) {
  const initials = `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase();

  const statusColors = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    INACTIVE: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    TERMINATED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <div className="group relative rounded-2xl border border-border bg-cardard p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      {/* Top Header Card */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          {/* Avatar Photo / Initials */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary text-base">
            {employee.metadata?.photoUrl ? (
              <img
                src={employee.metadata.photoUrl}
                alt={employee.fullName}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              initials
            )}
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500" />
          </div>

          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm md:text-base line-clamp-1">
              {employee.firstName} {employee.lastName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              ID: {employee.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
            statusColors[employee.status] || 'bg-muted text-muted-foreground',
          )}
        >
          {employee.status}
        </span>
      </div>

      {/* Info Body */}
      <div className="mt-5 space-y-2.5 border-t border-border/50 pt-4 text-xs text-muted-foreground">
        {(departmentName || employee.branch?.name) && (
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="truncate">
              {departmentName || 'No Department'} &bull; {employee.branch?.name || 'Main Branch'}
            </span>
          </div>
        )}
        {designationName && (
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="truncate">{designationName}</span>
          </div>
        )}
        {employee.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
        )}
        {employee.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span>{employee.phone}</span>
          </div>
        )}
        {employee.hireDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span>Joined: {new Date(employee.hireDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
        <span className="text-[10px] text-muted-foreground/60">
          Created {new Date(employee.createdAt).toLocaleDateString()}
        </span>
        <Link
          href={`/employees/${employee.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-1.5 transition-all"
        >
          View Profile
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

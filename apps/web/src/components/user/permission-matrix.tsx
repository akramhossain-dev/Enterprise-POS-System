'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search, CheckSquare, Square } from 'lucide-react';
import type { PermissionGroup } from '@/types/role';
import { cn } from '@/utils/cn';

interface PermissionMatrixProps {
  groups: PermissionGroup[];
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  readOnly?: boolean;
}

export function PermissionMatrix({
  groups,
  selectedPermissions,
  onChange,
  readOnly = false,
}: PermissionMatrixProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Expand first few groups by default
    const initial: Record<string, boolean> = {};
    groups.slice(0, 3).forEach((g) => {
      initial[g.module] = true;
    });
    return initial;
  });

  const toggleGroupExpanded = (module: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  const handlePermissionToggle = (pName: string) => {
    if (readOnly) return;
    const isSelected = selectedPermissions.includes(pName);
    if (isSelected) {
      onChange(selectedPermissions.filter((p) => p !== pName));
    } else {
      onChange([...selectedPermissions, pName]);
    }
  };

  const handleModuleSelectAllToggle = (
    module: string,
    permissionsList: string[],
    allSelected: boolean,
  ) => {
    if (readOnly) return;
    if (allSelected) {
      onChange(selectedPermissions.filter((p) => !permissionsList.includes(p)));
    } else {
      const added = [...selectedPermissions];
      permissionsList.forEach((p) => {
        if (!added.includes(p)) added.push(p);
      });
      onChange(added);
    }
  };

  // Filter groups and permissions based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;
    return groups
      .map((g) => {
        const matchingPermissions = g.permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())),
        );
        return {
          ...g,
          permissions: matchingPermissions,
        };
      })
      .filter((g) => g.permissions.length > 0);
  }, [groups, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Filter Header */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search permissions by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-border rounded-xl bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
        />
      </div>

      {readOnly && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl p-3 text-xs">
          <strong>Notice:</strong> This is a System-defined role. Permissions are write-protected
          and cannot be edited.
        </div>
      )}

      {/* Grid listing */}
      <div className="space-y-3">
        {filteredGroups.map((group) => {
          const pNames = group.permissions.map((p) => p.name);
          const selectedInGroup = group.permissions.filter((p) =>
            selectedPermissions.includes(p.name),
          );
          const isAllSelected = selectedInGroup.length === group.permissions.length;
          const isSomeSelected = selectedInGroup.length > 0 && !isAllSelected;
          const isExpanded = !!expandedGroups[group.module];

          return (
            <div
              key={group.module}
              className="border border-border/80 rounded-2xl bg-card overflow-hidden"
            >
              {/* Group Accordion Header */}
              <div className="flex items-center justify-between p-3 bg-muted/40 border-b border-border/50">
                <button
                  type="button"
                  onClick={() => toggleGroupExpanded(group.module)}
                  className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                  )}
                  {group.module.toUpperCase()} MODULE
                </button>

                {/* Select All Toggle */}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleModuleSelectAllToggle(group.module, pNames, isAllSelected)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-medium"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-3.5 h-3.5" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                    {isAllSelected ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              {/* Group Content Panel */}
              {isExpanded && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.permissions.map((p) => {
                    const isChecked = selectedPermissions.includes(p.name);
                    return (
                      <label
                        key={p.id}
                        className={cn(
                          'flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none text-left',
                          isChecked
                            ? 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                            : 'border-border/60 hover:bg-muted/45',
                          readOnly && 'cursor-default pointer-events-none opacity-80',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={readOnly}
                          onChange={() => handlePermissionToggle(p.name)}
                          className="mt-0.5 rounded border-muted-foreground text-primary focus:ring-primary h-3.5 w-3.5 shrink-0"
                        />
                        <div>
                          <div className="text-xs font-semibold text-foreground line-clamp-1">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                            {p.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="text-center py-10 text-xs text-muted-foreground">
            No permissions matching search criteria.
          </div>
        )}
      </div>
    </div>
  );
}

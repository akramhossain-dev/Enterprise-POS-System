'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { FolderOpen, ChevronRight, CornerDownRight } from 'lucide-react';
import { useDrilldownQuery } from '@/hooks/use-bi';

interface DrilldownCardProps {
  title: string;
  description?: string;
  className?: string;
}

interface Breadcrumb {
  id: string;
  name: string;
  level: number;
}

export function DrilldownCard({ title, description, className }: DrilldownCardProps) {
  const [level, setLevel] = useState(0);
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  const { data: nodes = [], isLoading } = useDrilldownQuery(level, parentId);

  const handleRowClick = (nodeId: string, nodeName: string) => {
    if (level >= 2) return; // Leaf node reached

    const nextLevel = level + 1;
    setLevel(nextLevel);
    setParentId(nodeId);
    setBreadcrumbs([...breadcrumbs, { id: nodeId, name: nodeName, level }]);
  };

  const handleBreadcrumbClick = (idx: number) => {
    if (idx === -1) {
      setLevel(0);
      setParentId(undefined);
      setBreadcrumbs([]);
    } else {
      const bc = breadcrumbs[idx];
      if (!bc) return;
      setLevel(bc.level + 1);
      setParentId(bc.id);
      setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
    }
  };

  const formatCurrency = (val: number) => {
    return (
      '$' + val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    );
  };

  return (
    <Card
      className={cn(
        'bg-card border-border text-foreground select-none text-left print:bg-white print:text-black',
        className,
      )}
    >
      <CardHeader className="py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-xs font-bold text-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
            <FolderOpen className="h-4 w-4 text-emerald-450" />
            <span>{title}</span>
          </CardTitle>
          {description && (
            <CardDescription className="text-[10px] text-muted-foreground font-mono mt-0.5">
              {description}
            </CardDescription>
          )}
        </div>

        {/* Drilldown breadcrumbs */}
        <div className="flex flex-wrap items-center gap-1 text-[9px] font-bold font-mono text-muted-foreground bg-muted px-2 py-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => handleBreadcrumbClick(-1)}
            className="hover:text-emerald-450"
          >
            ROOT
          </button>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={bc.id}>
              <ChevronRight className="h-2.5 w-2.5 text-slate-700" />
              <button
                type="button"
                onClick={() => handleBreadcrumbClick(idx)}
                className="hover:text-emerald-450 max-w-[100px] truncate uppercase"
              >
                {bc.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground font-bold uppercase tracking-wider text-[10px] pb-2">
                <th className="py-2.5 px-4">Entity</th>
                <th className="py-2.5 px-4 text-right">Transactions</th>
                <th className="py-2.5 px-4 text-right">Sales Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-muted-foreground">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-muted-foreground">
                    Loading drill-down hierarchy...
                  </td>
                </tr>
              ) : nodes.length > 0 ? (
                nodes.map((node) => (
                  <tr
                    key={node.id}
                    onClick={() => handleRowClick(node.id, node.name)}
                    className={cn(
                      'hover:bg-muted/20 transition-colors',
                      level < 2 ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    <td className="py-3 px-4 font-sans font-bold text-foreground flex items-center gap-1.5">
                      {level > 0 && <CornerDownRight className="h-3 w-3 text-slate-600" />}
                      <span>{node.name}</span>
                    </td>
                    <td className="py-3 px-4 text-right">{node.salesCount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-emerald-450 font-bold">
                      {formatCurrency(node.revenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-muted-foreground">
                    Drill-down level limit reached.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

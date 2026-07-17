'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Edit2,
  Trash2,
  Plus,
  Eye,
  Move,
  ListCollapse,
  ListPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/types/product';
import { cn } from '@/utils/cn';

interface CategoryTreeProps {
  categories: Category[];
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

export function CategoryTree({ categories, onDelete, onArchive }: CategoryTreeProps) {
  const router = useRouter();

  // Track expanded folder state by category ID
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Build nesting hierarchy
  const buildTree = (nodes: Category[], parentId: string | null = null): Category[] => {
    return nodes
      .filter((n) => n.parentId === parentId)
      .map((n) => ({
        ...n,
        children: buildTree(nodes, n.id),
      }))
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  };

  const tree = buildTree(categories, null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    categories.forEach((c) => {
      allIds[c.id] = true;
    });
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  // Recursive Tree Node Renderer
  const renderNode = (node: Category & { children?: Category[] }, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedIds[node.id];
    const isInactive = node.status === 'INACTIVE';

    return (
      <div key={node.id} className="space-y-1">
        {/* Node Row */}
        <div
          className={cn(
            'flex items-center justify-between group border border-border/40 hover:border-primary/20 rounded-lg p-2.5 transition-all duration-150',
            isInactive ? 'bg-muted/10 opacity-70' : 'bg-card',
            'hover:shadow-xs',
          )}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {/* Node Info & Expand Trigger */}
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.id)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6" /> // spacer
            )}

            {/* Folder Icon */}
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-primary" />
              ) : (
                <Folder className="w-4 h-4 text-primary" />
              )
            ) : (
              <Folder className="w-4 h-4 text-muted-foreground/60" />
            )}

            {/* Name & Details */}
            <div className="flex items-baseline gap-2 min-w-0 truncate">
              <span className="font-medium text-sm text-foreground truncate">{node.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground truncate opacity-0 group-hover:opacity-100 transition-opacity">
                /{node.slug || ''}
              </span>
            </div>

            {/* Inactive tag */}
            {isInactive && (
              <Badge variant="secondary" className="text-[10px] scale-90 px-1 py-0">
                Inactive
              </Badge>
            )}

            {/* Count Badge */}
            {node._count?.products !== undefined && node._count.products > 0 && (
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {node._count.products} products
              </span>
            )}
          </div>

          {/* Node Actions */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Move Foundation Trigger */}
            <button
              type="button"
              className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-muted transition-all duration-150 cursor-grab active:cursor-grabbing"
              title="Move Category (Drag Handle)"
            >
              <Move className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => router.push(`/products/categories/new?parentId=${node.id}`)}
              className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-muted transition-all duration-150"
              title="Add Child Category"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => router.push(`/products/categories/${node.id}`)}
              className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-muted transition-all duration-150"
              title="View Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => router.push(`/products/categories/${node.id}/edit`)}
              className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-muted transition-all duration-150"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onArchive(node.id)}
              className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted transition-all duration-150"
              title="Archive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Children Recursion */}
        {hasChildren && isExpanded && (
          <div className="space-y-1 relative">
            {/* Vertical connector line */}
            <div
              className="absolute w-px bg-border/40 left-0 top-0 bottom-2"
              style={{ marginLeft: `${level * 20 + 11}px` }}
            />
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Expand/Collapse toolbar */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={expandAll}
          leftIcon={<ListPlus className="w-3.5 h-3.5" />}
        >
          Expand All
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={collapseAll}
          leftIcon={<ListCollapse className="w-3.5 h-3.5" />}
        >
          Collapse All
        </Button>
      </div>

      {tree.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
          No categories found. Click Add Category to create one.
        </div>
      ) : (
        <div className="space-y-2 border border-border/50 rounded-xl p-4 bg-muted/5 max-h-[600px] overflow-y-auto">
          {tree.map((rootNode) => renderNode(rootNode))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useGroups,
} from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Trash2, Plus, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

export default function POSAccountCategoriesPage() {
  const { data: catData, isLoading } = useCategories();
  const { data: gpData } = useGroups();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const categories = catData?.data || [];
  const groups = gpData?.data || [];

  // Form local state
  const [catName, setCatName] = useState('');
  const [catGp, setCatGp] = useState('Current Assets');
  const [catDesc, setCatDesc] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error('Specify a category name.');
      return;
    }

    try {
      await createMutation.mutateAsync({ name: catName, groupName: catGp, description: catDesc });
      setCatName('');
      setCatDesc('');
    } catch {}
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this account category?');
    if (confirm) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {}
    }
  };

  return (
    <PageContainer className="text-foreground select-none text-left max-w-6xl mx-auto py-6">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/accounting">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Accounting Dashboard</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Account Categories Management"
        description="Verify categories rollups, reconcile account registers, and add categories to groups."
      />

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        {/* Creation form */}
        <div className="md:col-span-1">
          <Card className="bg-cardard border-border text-foreground h-full">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold text-muted-foreground">Register Category</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
                <div className="grid gap-1">
                  <label className="text-muted-foreground font-semibold">Category Name</label>
                  <Input
                    type="text"
                    placeholder="E.g., Cash equivalents, Fixed assets"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="bg-muted border-slate-855 text-xs text-foreground focus-visible:ring-emerald-500 h-9"
                  />
                </div>

                <div className="grid gap-1.5 text-left">
                  <label className="text-muted-foreground font-semibold">Account Group</label>
                  <select
                    value={catGp}
                    onChange={(e) => setCatGp(e.target.value)}
                    className="w-full bg-muted border border-slate-855 rounded p-2 text-xs text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {groups.map((gp) => (
                      <option key={gp.id} value={gp.name}>
                        {gp.name} ({gp.type})
                      </option>
                    ))}
                    {groups.length === 0 && <option value="Current Assets">Current Assets</option>}
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-muted-foreground font-semibold">Description</label>
                  <Input
                    type="text"
                    placeholder="Optional details notes"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="bg-muted border-slate-855 text-xs text-foreground focus-visible:ring-emerald-500 h-9"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs tracking-wider h-9 mt-2 gap-1"
                >
                  <Plus className="h-4 w-4" /> Save Category
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Categories table list */}
        <div className="md:col-span-2">
          <Card className="bg-cardard border-border text-foreground flex flex-col h-full overflow-hidden">
            <CardHeader className="pb-3 border-b border-border shrink-0">
              <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                <Bookmark className="h-4.5 w-4.5 text-emerald-400" />
                <span>Active Account Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto max-h-[420px] custom-scrollbar text-xs">
              {isLoading ? (
                <div className="text-center py-10 text-muted-foreground">Querying categories...</div>
              ) : categories.length > 0 ? (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[9px] bg-slate-955/25">
                      <th className="py-2.5 px-4">Category Name</th>
                      <th className="py-2.5 px-3">Parent Group</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-slate-355 font-medium">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-accent/10">
                        <td className="py-3 px-4 font-bold text-foreground">{cat.name}</td>
                        <td className="py-3 px-3 text-muted-foreground font-mono text-[10px]">
                          {cat.groupName}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground truncate max-w-[150px]">
                          {cat.description || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(cat.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-rose-455"
                            title="Delete Category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No account categories registered.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

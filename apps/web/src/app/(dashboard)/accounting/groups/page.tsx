'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGroups, useCreateGroup, useDeleteGroup } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Trash2, Plus, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

export default function POSAccountGroupsPage() {
  const { data: groupData, isLoading } = useGroups();
  const createMutation = useCreateGroup();
  const deleteMutation = useDeleteGroup();

  const groups = groupData?.data || [];

  // Form local state
  const [gpName, setGpName] = useState('');
  const [gpType, setGpType] = useState<'ASSETS' | 'LIABILITIES' | 'EQUITY' | 'INCOME' | 'EXPENSE'>(
    'ASSETS',
  );
  const [gpDesc, setGpDesc] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gpName.trim()) {
      toast.error('Specify a group name.');
      return;
    }

    try {
      await createMutation.mutateAsync({ name: gpName, type: gpType, description: gpDesc });
      setGpName('');
      setGpDesc('');
    } catch {}
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this account group?');
    if (confirm) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {}
    }
  };

  return (
    <PageContainer className="text-slate-100 select-none text-left max-w-6xl mx-auto py-6">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/accounting">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Accounting Dashboard</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Account Groups Management"
        description="Verify ledger group types, categorize income/expenses clusters, and register GAAP parent nodes."
      />

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        {/* Creation form */}
        <div className="md:col-span-1">
          <Card className="bg-[#0c1220] border-slate-800 text-slate-100 h-full">
            <CardHeader className="pb-3 border-b border-slate-900">
              <CardTitle className="text-sm font-bold text-slate-350">Register New Group</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
                <div className="grid gap-1">
                  <label className="text-slate-400 font-semibold">Group Name</label>
                  <Input
                    type="text"
                    placeholder="E.g., Fixed Assets, Long Liabilities"
                    value={gpName}
                    onChange={(e) => setGpName(e.target.value)}
                    className="bg-slate-950 border-slate-855 text-xs text-slate-100 focus-visible:ring-emerald-500 h-9"
                  />
                </div>

                <div className="grid gap-1.5 text-left">
                  <label className="text-slate-400 font-semibold">Account Type</label>
                  <select
                    value={gpType}
                    onChange={(e) => setGpType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-855 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="ASSETS">Assets</option>
                    <option value="LIABILITIES">Liabilities</option>
                    <option value="EQUITY">Equity</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-slate-400 font-semibold">Description</label>
                  <Input
                    type="text"
                    placeholder="Optional details notes"
                    value={gpDesc}
                    onChange={(e) => setGpDesc(e.target.value)}
                    className="bg-slate-950 border-slate-855 text-xs text-slate-100 focus-visible:ring-emerald-500 h-9"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs tracking-wider h-9 mt-2 gap-1"
                >
                  <Plus className="h-4 w-4" /> Save Group
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Groups table list */}
        <div className="md:col-span-2">
          <Card className="bg-[#0c1220] border-slate-800 text-slate-100 flex flex-col h-full overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-900 shrink-0">
              <CardTitle className="text-sm font-bold text-slate-350 flex items-center gap-1.5">
                <Bookmark className="h-4.5 w-4.5 text-emerald-400" />
                <span>Active Account Groups</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto max-h-[420px] custom-scrollbar text-xs">
              {isLoading ? (
                <div className="text-center py-10 text-slate-500">Querying groups...</div>
              ) : groups.length > 0 ? (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider text-[9px] bg-slate-955/25">
                      <th className="py-2.5 px-4">Group Name</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-350">
                    {groups.map((gp) => (
                      <tr key={gp.id} className="hover:bg-slate-900/10">
                        <td className="py-3 px-4 font-bold text-slate-200">{gp.name}</td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                          {gp.type}
                        </td>
                        <td className="py-3 px-3 text-slate-500 truncate max-w-[150px]">
                          {gp.description || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(gp.id)}
                            className="h-7 w-7 text-slate-500 hover:text-rose-455"
                            title="Delete Group"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  No account groups registered.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

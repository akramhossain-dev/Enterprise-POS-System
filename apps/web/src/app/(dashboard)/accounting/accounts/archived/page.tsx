'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccounts, useRestoreAccount } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, FolderLock } from 'lucide-react';
import { toast } from 'sonner';

export default function POSArchivedAccountsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch archived accounts
  const { data: accData, isLoading } = useAccounts({
    status: 'ARCHIVED',
    page: currentPage,
    limit: 50,
  });

  const restoreMutation = useRestoreAccount();
  const accounts = accData?.data || [];

  const handleRestore = async (id: string) => {
    try {
      await restoreMutation.mutateAsync(id);
      toast.success('Account restored to Chart of Accounts.');
    } catch {}
  };

  return (
    <PageContainer className="text-foreground select-none text-left max-w-4xl mx-auto py-6">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/accounting/accounts">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Active Accounts</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Archived Accounts Registry"
        description="Verify legacy accounts, review old balances, and restore deleted records back to ledger cycles."
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Querying archive directory...
          </div>
        ) : accounts.length > 0 ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-855 text-muted-foreground font-bold uppercase tracking-wider text-[10px] bg-slate-955/35">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-right">Closing Balance</th>
                  <th className="py-3 px-4 text-center">Restore Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-muted-foreground">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-accent/20">
                    <td className="py-3 px-4 font-bold text-foreground">{acc.code}</td>
                    <td className="py-3 px-4 font-sans font-bold text-foreground">{acc.name}</td>
                    <td className="py-3 px-3 font-sans text-xs text-muted-foreground">
                      {acc.type}
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(acc.id)}
                        disabled={restoreMutation.isPending}
                        className="h-7 px-3 border-emerald-900/50 bg-emerald-950/10 text-emerald-450 hover:bg-emerald-950/20 text-[10px] uppercase font-bold"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Restore
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground">
            <FolderLock className="h-10 w-10 mb-2 text-slate-800 mx-auto" />
            <p className="text-xs">No archived accounting records registered.</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

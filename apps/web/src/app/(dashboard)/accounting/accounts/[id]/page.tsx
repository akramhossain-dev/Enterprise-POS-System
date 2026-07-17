'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useAccountDetails } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BalanceBadge } from '@/components/accounting/balance-badge';
import { ArrowLeft, Loader2, Edit3, ClipboardList } from 'lucide-react';

interface Params {
  id: string;
}

export default function AccountDetailsPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const { data: account, isLoading, isError } = useAccountDetails(id);

  return (
    <PageContainer className="max-w-4xl mx-auto py-6 text-foreground select-none text-left">
      {/* Back link */}
      <div className="mb-4">
        <Link href="/accounting/accounts">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Chart of Accounts</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Ledger Account Details"
        description="Verify financial code setups, balance categories, parent linkages, and descriptions."
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-xs">Loading ledger record...</p>
        </div>
      ) : isError || !account ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl text-rose-455 text-xs">
          Failed to load ledger account details.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-cardard border-border text-foreground">
              <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-muted-foreground">
                  General Configuration
                </CardTitle>
                <Link href={`/accounting/accounts/${account.id}/edit`}>
                  <Button
                    size="sm"
                    className="h-7 bg-accent border border-border hover:bg-slate-800 text-foreground text-[10px] gap-1 font-bold uppercase"
                  >
                    <Edit3 className="h-3 w-3" /> Edit account
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs sm:text-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Account Code
                    </span>
                    <span className="font-mono font-bold text-foreground">{account.code}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Account Name
                    </span>
                    <span className="font-bold text-foreground">{account.name}</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2.5 border-t border-border/60">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Account Group Type
                    </span>
                    <span className="text-foreground font-semibold">{account.type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Parent Association
                    </span>
                    <span className="text-muted-foreground">
                      {account.parentAccountCode
                        ? `${account.parentAccountCode} (${account.parentAccountName || 'Parent'})`
                        : 'Top-Level Node'}
                    </span>
                  </div>
                </div>

                {account.description && (
                  <div className="pt-3 border-t border-border/60 text-left">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                      Description
                    </span>
                    <p className="text-muted-foreground leading-relaxed text-xs">{account.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Balance card */}
          <div className="md:col-span-1">
            <Card className="bg-cardard border-border text-foreground">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold text-muted-foreground">
                  Ledger Balance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs font-mono text-left">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Opening Balance:</span>
                  <span className="text-foreground font-bold">
                    ${account.openingBalance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Balance Type:</span>
                  <BalanceBadge type={account.balanceType} />
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-border/80">
                  <span className="text-muted-foreground font-black">Current Balance:</span>
                  <span className="text-base font-black text-emerald-400">
                    ${account.balance.toFixed(2)}
                  </span>
                </div>

                <div className="bg-muted/40 p-3 rounded-lg border border-border text-muted-foreground font-sans text-[10px] leading-normal flex items-start gap-1.5 mt-2">
                  <ClipboardList className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                  <p>
                    All calculations are strictly GAAP compliant. Inactive subaccount balances roll
                    up to parents.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

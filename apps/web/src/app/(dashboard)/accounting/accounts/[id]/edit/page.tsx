'use client';

import React, { use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAccountDetails, useUpdateAccount, useAccounts } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const accountSchema = zod.object({
  code: zod.string().min(3, 'Account code must be at least 3 characters long.'),
  name: zod.string().min(3, 'Account name must be at least 3 characters.'),
  type: zod.enum(['ASSETS', 'LIABILITIES', 'EQUITY', 'INCOME', 'EXPENSE']),
  parentAccountCode: zod.string().optional(),
  openingBalance: zod.coerce.number().min(0, 'Opening balance cannot be negative.'),
  balanceType: zod.enum(['DEBIT', 'CREDIT']),
  description: zod.string().optional(),
});

type AccountFormValues = zod.infer<typeof accountSchema>;

interface Params {
  id: string;
}

export default function POSEditAccountPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: account, isLoading: detailsLoading } = useAccountDetails(id);
  const updateMutation = useUpdateAccount();

  // Retrieve existing accounts for Parent selector
  const { data: accData } = useAccounts({ limit: 100 });
  const parentOptions = accData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
  });

  // Pre-fill form
  useEffect(() => {
    if (account) {
      setValue('code', account.code);
      setValue('name', account.name);
      setValue('type', account.type);
      setValue('parentAccountCode', account.parentAccountCode || '');
      setValue('openingBalance', account.openingBalance);
      setValue('balanceType', account.balanceType);
      setValue('description', account.description || '');
    }
  }, [account, setValue]);

  const onSubmit = async (values: AccountFormValues) => {
    try {
      await updateMutation.mutateAsync({ id, payload: values });
      router.push('/accounting/accounts');
    } catch {}
  };

  return (
    <PageContainer className="max-w-3xl mx-auto py-6 text-foreground select-none text-left">
      {/* Back link */}
      <div className="mb-4">
        <Link href={`/accounting/accounts/${id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Account Details</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Edit Ledger Account"
        description="Modify accounting codes, parent mappings, balances type classifications, and description notes."
      />

      {detailsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-xs">Loading ledger record...</p>
        </div>
      ) : (
        <Card className="bg-card border-border text-foreground mt-6">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Account Code */}
                <div className="grid gap-1.5">
                  <label className="text-muted-foreground font-semibold font-mono">
                    Account Code
                  </label>
                  <Input
                    type="text"
                    {...register('code')}
                    className="bg-muted border-slate-855 text-xs text-foreground font-mono focus-visible:ring-emerald-500"
                  />
                  {errors.code && (
                    <p className="text-[10px] text-rose-455 font-mono">{errors.code.message}</p>
                  )}
                </div>

                {/* Account Name */}
                <div className="grid gap-1.5">
                  <label className="text-muted-foreground font-semibold">Account Name</label>
                  <Input
                    type="text"
                    {...register('name')}
                    className="bg-muted border-slate-855 text-xs text-foreground focus-visible:ring-emerald-500"
                  />
                  {errors.name && (
                    <p className="text-[10px] text-rose-455">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Account Type */}
                <div className="grid gap-1.5 text-left">
                  <label className="text-muted-foreground font-semibold">
                    Account Category Type
                  </label>
                  <select
                    {...register('type')}
                    className="bg-muted border border-slate-855 rounded p-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="ASSETS">Assets</option>
                    <option value="LIABILITIES">Liabilities</option>
                    <option value="EQUITY">Equity</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                  {errors.type && (
                    <p className="text-[10px] text-rose-455">{errors.type.message}</p>
                  )}
                </div>

                {/* Parent Account */}
                <div className="grid gap-1.5 text-left">
                  <label className="text-muted-foreground font-semibold">
                    Parent Association Account
                  </label>
                  <select
                    {...register('parentAccountCode')}
                    className="bg-muted border border-slate-855 rounded p-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">None (Top-Level Account)</option>
                    {parentOptions
                      .filter((o) => o.id !== id) // Prevent self-referencing loops
                      .map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.code} — {opt.name} ({opt.type})
                        </option>
                      ))}
                  </select>
                  {errors.parentAccountCode && (
                    <p className="text-[10px] text-rose-455">{errors.parentAccountCode.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Opening Balance */}
                <div className="grid gap-1.5">
                  <label className="text-muted-foreground font-semibold font-mono">
                    Opening Balance ($)
                  </label>
                  <Input
                    type="number"
                    {...register('openingBalance')}
                    className="bg-muted border-slate-855 text-xs text-foreground font-mono focus-visible:ring-emerald-500"
                  />
                  {errors.openingBalance && (
                    <p className="text-[10px] text-rose-455 font-mono">
                      {errors.openingBalance.message}
                    </p>
                  )}
                </div>

                {/* Balance Type */}
                <div className="grid gap-1.5 text-left">
                  <label className="text-muted-foreground font-semibold">
                    Balance Classification
                  </label>
                  <select
                    {...register('balanceType')}
                    className="bg-muted border border-slate-855 rounded p-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="DEBIT">Debit (Asset/Expense increases)</option>
                    <option value="CREDIT">Credit (Liability/Revenue/Equity increases)</option>
                  </select>
                  {errors.balanceType && (
                    <p className="text-[10px] text-rose-455">{errors.balanceType.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-1.5 text-left">
                <label className="text-muted-foreground font-semibold">
                  Account Description / Notes
                </label>
                <textarea
                  {...register('description')}
                  className="w-full bg-muted border border-slate-855 rounded p-2 text-xs text-foreground focus:outline-none focus:border-emerald-500 h-16 resize-none"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs tracking-wider h-10 mt-2 gap-1.5"
              >
                <CheckCircle className="h-4.5 w-4.5" />
                <span>
                  {updateMutation.isPending ? 'SAVING CHANGES...' : 'SAVE LEDGER CHANGES'}
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

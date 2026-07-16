'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useTaxRates, useCreateTaxRate, useTaxGroups } from '@/hooks/use-accounting';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Settings, ShieldCheck, Tag } from 'lucide-react';

const taxRateFormSchema = zod.object({
  name: zod.string().min(3, 'Tax rate identifier must be at least 3 characters.'),
  rate: zod.coerce
    .number()
    .min(0, 'Percentage rate cannot be negative.')
    .max(100, 'Max tax rate is 100%.'),
  type: zod.enum(['VAT', 'GST', 'SALES', 'PURCHASE']),
  notes: zod.string().optional(),
});

type TaxRateFormValues = zod.infer<typeof taxRateFormSchema>;

export default function TaxRatesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: rates = [], refetch } = useTaxRates();
  const { data: groups = [] } = useTaxGroups();

  const createMutation = useCreateTaxRate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaxRateFormValues>({
    resolver: zodResolver(taxRateFormSchema),
    defaultValues: {
      name: '',
      rate: 0,
      type: 'VAT',
      notes: '',
    },
  });

  const onSubmit = async (values: TaxRateFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      setIsCreateOpen(false);
      reset();
      void refetch();
    } catch {}
  };

  return (
    <PageContainer className="text-slate-100 select-none text-left">
      {/* Back link */}
      <div className="mb-4 flex justify-between items-center">
        <Link href="/accounting/tax">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Tax Dashboard</span>
          </Button>
        </Link>

        <Button
          size="sm"
          onClick={() => {
            reset();
            setIsCreateOpen(true);
          }}
          className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Define Tax Rate</span>
        </Button>
      </div>

      <PageHeader
        title="Tax Configuration Desk"
        description="Establish corporate tax rules, modify VAT/GST thresholds, and bundle rates into unified tax groups."
      />

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        {/* Left Column: Tax Rates listing */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left font-sans flex items-center gap-1.5">
            <Settings className="h-4 w-4 text-emerald-450" />
            <span>Defined Tax Rates</span>
          </h3>

          <div className="space-y-3">
            {rates.length > 0 ? (
              rates.map((rate) => (
                <Card
                  key={rate.id}
                  className="bg-[#0c1220] border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-150">{rate.name}</p>
                        <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-450 px-1.5 py-0.5 rounded font-black">
                          {rate.type}
                        </span>
                      </div>
                      {rate.notes && <p className="text-[10px] text-slate-500">{rate.notes}</p>}
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-emerald-450">
                        {rate.rate}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-850 text-slate-500 text-xs">
                No custom tax rates set up.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tax Groups */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left font-sans flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-indigo-400" />
            <span>Bundled Tax Groups</span>
          </h3>

          <div className="space-y-3">
            {groups.length > 0 ? (
              groups.map((group) => (
                <Card
                  key={group.id}
                  className="bg-[#0c1220] border-slate-800 p-4 space-y-3 text-left"
                >
                  <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                    <p className="text-xs font-bold text-slate-200">{group.name}</p>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 rounded font-bold">
                      {group.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                      Included Rates:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {group.rates.map((rateId: any) => {
                        const matchingRate = rates.find((r: any) => r.id === rateId);
                        return (
                          <span
                            key={rateId}
                            className="text-[8px] font-mono bg-slate-950/80 border border-slate-900 px-1.5 py-0.5 rounded text-slate-350"
                          >
                            {matchingRate ? `${matchingRate.name} (${matchingRate.rate}%)` : rateId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-850 text-slate-500 text-xs">
                No composite tax groups defined.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Define Tax Rate Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#0c1220] border border-slate-800 text-slate-100 max-w-md p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-black uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-emerald-450" />
              <span>Define Corporate Tax Rate</span>
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Establish a new percentage rate inside the central tax matrix.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm">
            {/* Name */}
            <div className="grid gap-1.5 text-left">
              <label className="text-slate-400 font-semibold">Tax Name / Label *</label>
              <Input
                type="text"
                placeholder="E.g., Standard VAT (15%)"
                {...register('name')}
                className="bg-slate-950 border-slate-855 text-xs text-slate-100 focus-visible:ring-emerald-500"
              />
              {errors.name && <p className="text-[10px] text-rose-455">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Rate */}
              <div className="grid gap-1.5">
                <label className="text-slate-400 font-semibold font-mono">
                  Tax Percentage (%) *
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  {...register('rate')}
                  className="bg-slate-950 border-slate-855 text-xs text-slate-100 font-mono focus-visible:ring-emerald-500 h-9"
                />
                {errors.rate && (
                  <p className="text-[10px] text-rose-455 font-mono">{errors.rate.message}</p>
                )}
              </div>

              {/* Type */}
              <div className="grid gap-1.5 text-left">
                <label className="text-slate-400 font-semibold">Tax Class *</label>
                <select
                  {...register('type')}
                  className="bg-slate-950 border border-slate-855 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer h-9"
                >
                  <option value="VAT">Value Added Tax (VAT)</option>
                  <option value="GST">Goods & Services Tax (GST)</option>
                  <option value="SALES">Sales Tax (Output)</option>
                  <option value="PURCHASE">Purchase Tax (Input)</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-1.5 text-left">
              <label className="text-slate-400 font-semibold">Audit Notes</label>
              <textarea
                placeholder="Notes or legislative reference code..."
                {...register('notes')}
                className="w-full bg-slate-950 border border-slate-855 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 h-16 resize-none"
              />
            </div>

            {/* Actions */}
            <DialogFooter className="flex sm:justify-between items-center pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 border-slate-800 text-slate-400 hover:text-slate-200 bg-[#0c1220]"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs"
              >
                {createMutation.isPending ? 'CREATING...' : 'DEFINE TAX'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
